import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import generatePromptPayPayload from 'promptpay-qr';
import * as QRCode from 'qrcode';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from '../../admin/services/audit.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Currency, Transaction, TransactionStatus } from '../../transactions/entities/transaction.entity';
import { Order, OrderStatus } from '../entities/order.entity';
import { ThaiPaymentMethod, ThaiPaymentMethodStatus, ThaiPaymentMethodType } from '../entities/thai-payment-method.entity';

export interface ThaiPaymentRequest {
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  merchantInfo: {
    merchantId: string;
    terminalId?: string;
  };
  metadata?: Record<string, any>;
}

export interface ThaiPaymentResponse {
  success: boolean;
  paymentId: string;
  paymentUrl?: string;
  qrCode?: string;
  deepLink?: string;
  redirectUrl?: string;
  expiresAt?: Date;
  error?: string;
}

@Injectable()
export class ThaiPaymentService {
  private readonly logger = new Logger(ThaiPaymentService.name);

  constructor(
    @InjectRepository(ThaiPaymentMethod)
    private thaiPaymentMethodRepository: Repository<ThaiPaymentMethod>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    private readonly encryptionService: EncryptionService,
    private readonly auditService: AuditService,
  ) {}

  // Create Thai Payment Method
  async createPaymentMethod(
    merchantId: string,
    type: ThaiPaymentMethodType,
    config: any,
    name: string,
    description?: string,
  ): Promise<ThaiPaymentMethod> {
    const merchant = await this.merchantRepository.findOne({ where: { id: merchantId } });
    if (!merchant) {
      await this.auditService.log({ action: 'createPaymentMethod', merchantId, type, status: 'failed', reason: 'Merchant not found' });
      throw new NotFoundException('Merchant not found');
    }
    // Encrypt sensitive config
    const encryptedConfig = await this.encryptionService.encryptPaymentConfig(config);
    const paymentMethod = this.thaiPaymentMethodRepository.create({
      merchantId,
      type,
      name,
      description,
      config: encryptedConfig,
      status: ThaiPaymentMethodStatus.PENDING_APPROVAL,
      limits: {
        minAmount: 1,
        maxAmount: 100000,
        dailyLimit: 1000000,
        monthlyLimit: 10000000,
        currency: 'THB',
      },
      feePercentage: this.getDefaultFeePercentage(type),
      feeFixed: this.getDefaultFeeFixed(type),
    });
    const saved = await this.thaiPaymentMethodRepository.save(paymentMethod);
    await this.auditService.log({ action: 'createPaymentMethod', merchantId, type, status: 'success', paymentMethodId: saved.id });
    return saved;
  }

  // Get Payment Methods for Merchant
  async getPaymentMethods(merchantId: string): Promise<ThaiPaymentMethod[]> {
    return this.thaiPaymentMethodRepository.find({
      where: { merchantId, isEnabled: true },
      order: { priority: 'ASC', createdAt: 'DESC' },
    });
  }

  // Generate Payment Request
  async generatePaymentRequest(
    orderId: string,
    paymentMethodId: string,
    amount: number,
    currency: Currency = Currency.THB,
  ): Promise<any> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      await this.auditService.log({ action: 'generatePaymentRequest', orderId, paymentMethodId, status: 'failed', reason: 'Order not found' });
      throw new NotFoundException('Order not found');
    }
    const paymentMethod = await this.thaiPaymentMethodRepository.findOne({
      where: { id: paymentMethodId, isEnabled: true },
    });
    if (!paymentMethod) {
      await this.auditService.log({ action: 'generatePaymentRequest', orderId, paymentMethodId, status: 'failed', reason: 'Payment method not found or disabled' });
      throw new NotFoundException('Payment method not found or disabled');
    }
    // Decrypt config
    const decryptedConfig = await this.encryptionService.decryptPaymentConfig(paymentMethod.config);
    // Create transaction
    const transaction = this.transactionRepository.create({
      transactionId: `TXN-${uuidv4().substring(0, 8).toUpperCase()}`,
      amount,
      currency,
      status: TransactionStatus.PENDING,
      merchant: order.merchant,
      order,
      thaiPaymentMethod: paymentMethod,
      description: `Payment for order ${order.orderNumber}`,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      customerName: order.customerName,
    });
    const savedTransaction = await this.transactionRepository.save(transaction);
    await this.auditService.log({ action: 'createTransaction', transactionId: savedTransaction.transactionId, orderId, paymentMethodId, amount, status: 'pending' });
    // Generate payment data based on method type
    const paymentData = await this.generatePaymentData({ ...paymentMethod, config: decryptedConfig }, savedTransaction, order);
    return {
      transactionId: savedTransaction.transactionId,
      paymentData,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    };
  }

  // Generate Payment Data based on method type
  private async generatePaymentData(
    paymentMethod: ThaiPaymentMethod,
    transaction: Transaction,
    order: Order,
  ): Promise<any> {
    switch (paymentMethod.type) {
      case ThaiPaymentMethodType.PROMPTPAY:
        return this.generatePromptPayData(transaction, order);
      case ThaiPaymentMethodType.KBANK:
        return this.generateKBankData(transaction, order);
      case ThaiPaymentMethodType.SCB_EASY:
        return this.generateSCBEasyData(transaction, order);
      case ThaiPaymentMethodType.TRUEMONEY:
        return this.generateTrueMoneyData(transaction, order);
      case ThaiPaymentMethodType.GBPRIMEPAY:
        return this.generateGBPrimePayData(transaction, order);
      default:
        throw new BadRequestException(`Unsupported payment method: ${paymentMethod.type}`);
    }
  }

  // Generate PromptPay QR Code
  private async generatePromptPayData(transaction: Transaction, order: Order): Promise<any> {
    const promptPayId = order.thaiSpecific?.promptPayId || '0812345678';
    const qrData = this.generatePromptPayQRData(promptPayId, transaction.amount);

    const qrCode = await QRCode.toDataURL(qrData);

    return {
      type: 'qr_code',
      qrCode,
      qrData,
      promptPayId,
      amount: transaction.amount,
      currency: transaction.currency,
    };
  }

  // Generate KBank Payment Data
  private async generateKBankData(transaction: Transaction, order: Order): Promise<any> {
    const config = order.merchant?.thaiPaymentMethods?.find(
      pm => pm.type === ThaiPaymentMethodType.KBANK
    )?.config;
    const decryptedConfig = config ? await this.encryptionService.decryptPaymentConfig(config) : {};
    try {
      const kbankResponse = await this.callKBankAPI(transaction, decryptedConfig);
      return {
        type: 'redirect',
        paymentUrl: kbankResponse.paymentUrl,
        transactionId: kbankResponse.transactionId,
        amount: transaction.amount,
        currency: transaction.currency,
      };
    } catch (error) {
      await this.auditService.log({ action: 'generateKBankData', transactionId: transaction.transactionId, error: error?.message || error });
      throw error;
    }
  }

  // Generate SCB Easy Payment Data
  private async generateSCBEasyData(transaction: Transaction, order: Order): Promise<any> {
    const config = order.merchant?.thaiPaymentMethods?.find(
      pm => pm.type === ThaiPaymentMethodType.SCB_EASY
    )?.config;
    const decryptedConfig = config ? await this.encryptionService.decryptPaymentConfig(config) : {};
    try {
      const scbResponse = await this.callSCBEasyAPI(transaction, decryptedConfig);
      return {
        type: 'deep_link',
        paymentUrl: scbResponse.paymentUrl,
        transactionId: scbResponse.transactionId,
        amount: transaction.amount,
        currency: transaction.currency,
      };
    } catch (error) {
      await this.auditService.log({ action: 'generateSCBEasyData', transactionId: transaction.transactionId, error: error?.message || error });
      throw error;
    }
  }

  // Generate TrueMoney Payment Data
  private async generateTrueMoneyData(transaction: Transaction, order: Order): Promise<any> {
    const config = order.merchant?.thaiPaymentMethods?.find(
      pm => pm.type === ThaiPaymentMethodType.TRUEMONEY
    )?.config;
    const decryptedConfig = config ? await this.encryptionService.decryptPaymentConfig(config) : {};
    try {
      const trueMoneyResponse = await this.callTrueMoneyAPI(transaction, decryptedConfig);
      return {
        type: 'deep_link',
        paymentUrl: trueMoneyResponse.paymentUrl,
        transactionId: trueMoneyResponse.transactionId,
        amount: transaction.amount,
        currency: transaction.currency,
      };
    } catch (error) {
      await this.auditService.log({ action: 'generateTrueMoneyData', transactionId: transaction.transactionId, error: error?.message || error });
      throw error;
    }
  }

  // Generate GBPrimePay Payment Data
  private async generateGBPrimePayData(transaction: Transaction, order: Order): Promise<any> {
    const config = order.merchant?.thaiPaymentMethods?.find(
      pm => pm.type === ThaiPaymentMethodType.GBPRIMEPAY
    )?.config;
    const decryptedConfig = config ? await this.encryptionService.decryptPaymentConfig(config) : {};
    try {
      const gbPrimePayResponse = await this.callGBPrimePayAPI(transaction, decryptedConfig);
      return {
        type: 'redirect',
        paymentUrl: gbPrimePayResponse.paymentUrl,
        transactionId: gbPrimePayResponse.transactionId,
        amount: transaction.amount,
        currency: transaction.currency,
      };
    } catch (error) {
      await this.auditService.log({ action: 'generateGBPrimePayData', transactionId: transaction.transactionId, error: error?.message || error });
      throw error;
    }
  }

  // Generate PromptPay QR Data
  private generatePromptPayQRData(promptPayId: string, amount: number): string {
    // ใช้ promptpay-qr library เพื่อสร้าง EMVCo QR code จริง
    // รองรับทั้งเบอร์มือถือ, เลขบัตรประชาชน, เลข e-wallet
    return generatePromptPayPayload(promptPayId, { amount });
  }

  // Simulate KBank API call (Production: Call real KBank Open API)
  private async callKBankAPI(transaction: Transaction, config: any): Promise<any> {
    // TODO: Replace with your real KBank Open API credentials and endpoint
    const apiKey = config?.apiKey || process.env.KBANK_API_KEY;
    const secretKey = config?.secretKey || process.env.KBANK_SECRET_KEY;
    const merchantId = config?.merchantId || process.env.KBANK_MERCHANT_ID;
    const endpoint = config?.endpoint || process.env.KBANK_API_ENDPOINT || 'https://openapi.kasikornbank.com/payment/v1/qr';

    try {
      // Example: Create QR Payment (Production API Spec)
      const payload = {
        merchantId,
        amount: transaction.amount,
        currency: transaction.currency,
        referenceNo: transaction.transactionId,
        description: transaction.description,
        // ...other required fields by KBank API...
      };

      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        // 'Authorization': 'Bearer <access_token>' // If OAuth2 is required
      };

      // Call KBank Open API (POST)
      const response = await axios.post(endpoint, payload, { headers, timeout: 10000 });
      const data = response.data;

      // Handle KBank API response (adjust field names as per real API)
      return {
        transactionId: data.referenceNo || transaction.transactionId,
        paymentUrl: data.qrImageUrl || data.paymentUrl,
        status: data.status || 'pending',
        raw: data,
      };
    } catch (error: any) {
      this.logger.error('KBank API error', error?.response?.data || error.message);
      throw new BadRequestException('KBank API error: ' + (error?.response?.data?.message || error.message));
    }
  }

  // Simulate SCB Easy API call (Production: Call real SCB Easy API)
  private async callSCBEasyAPI(transaction: Transaction, config: any): Promise<any> {
    // TODO: Replace with your real SCB Easy API credentials and endpoint
    const apiKey = config?.apiKey || process.env.SCB_API_KEY;
    const secretKey = config?.secretKey || process.env.SCB_SECRET_KEY;
    const merchantId = config?.merchantId || process.env.SCB_MERCHANT_ID;
    const endpoint = config?.endpoint || process.env.SCB_API_ENDPOINT || 'https://api.scbeasy.com/v1/payment/qr';

    try {
      // Example: Create QR Payment (Production API Spec)
      const payload = {
        merchantId,
        amount: transaction.amount,
        currency: transaction.currency,
        referenceNo: transaction.transactionId,
        description: transaction.description,
        // ...other required fields by SCB API...
      };

      const headers = {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
        // 'Authorization': 'Bearer <access_token>' // If OAuth2 is required
      };

      // Call SCB Easy API (POST)
      const response = await axios.post(endpoint, payload, { headers, timeout: 10000 });
      const data = response.data;

      // Handle SCB API response (adjust field names as per real API)
      return {
        transactionId: data.referenceNo || transaction.transactionId,
        paymentUrl: data.qrImageUrl || data.paymentUrl,
        status: data.status || 'pending',
        raw: data,
      };
    } catch (error: any) {
      this.logger.error('SCB Easy API error', error?.response?.data || error.message);
      throw new BadRequestException('SCB Easy API error: ' + (error?.response?.data?.message || error.message));
    }
  }

  // Simulate TrueMoney API call (Production: Call real TrueMoney API)
  private async callTrueMoneyAPI(transaction: Transaction, config: any): Promise<any> {
    // TODO: Replace with your real TrueMoney API credentials and endpoint
    const apiKey = config?.apiKey || process.env.TRUEMONEY_API_KEY;
    const secretKey = config?.secretKey || process.env.TRUEMONEY_SECRET_KEY;
    const merchantId = config?.merchantId || process.env.TRUEMONEY_MERCHANT_ID;
    const endpoint = config?.endpoint || process.env.TRUEMONEY_API_ENDPOINT || 'https://api.truemoney.com/v1/payment/qr';

    try {
      // Example: Create QR Payment (Production API Spec)
      const payload = {
        merchantId,
        amount: transaction.amount,
        currency: transaction.currency,
        referenceNo: transaction.transactionId,
        description: transaction.description,
        // ...other required fields by TrueMoney API...
      };

      const headers = {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
        // 'Authorization': 'Bearer <access_token>' // If OAuth2 is required
      };

      // Call TrueMoney API (POST)
      const response = await axios.post(endpoint, payload, { headers, timeout: 10000 });
      const data = response.data;

      // Handle TrueMoney API response (adjust field names as per real API)
      return {
        transactionId: data.referenceNo || transaction.transactionId,
        paymentUrl: data.qrImageUrl || data.paymentUrl,
        status: data.status || 'pending',
        raw: data,
      };
    } catch (error: any) {
      this.logger.error('TrueMoney API error', error?.response?.data || error.message);
      throw new BadRequestException('TrueMoney API error: ' + (error?.response?.data?.message || error.message));
    }
  }

  // Simulate GBPrimePay API call (Production: Call real GBPrimePay API)
  private async callGBPrimePayAPI(transaction: Transaction, config: any): Promise<any> {
    // TODO: Replace with your real GBPrimePay API credentials and endpoint
    const apiKey = config?.apiKey || process.env.GBPRIMEPAY_API_KEY;
    const secretKey = config?.secretKey || process.env.GBPRIMEPAY_SECRET_KEY;
    const merchantId = config?.merchantId || process.env.GBPRIMEPAY_MERCHANT_ID;
    const endpoint = config?.endpoint || process.env.GBPRIMEPAY_API_ENDPOINT || 'https://api.gbprimepay.com/v3/qrcode';

    try {
      // Example: Create QR Payment (Production API Spec)
      const payload = {
        merchantId,
        amount: transaction.amount,
        currency: transaction.currency,
        referenceNo: transaction.transactionId,
        description: transaction.description,
        // ...other required fields by GBPrimePay API...
      };

      const headers = {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
        // 'Authorization': 'Bearer <access_token>' // If OAuth2 is required
      };

      // Call GBPrimePay API (POST)
      const response = await axios.post(endpoint, payload, { headers, timeout: 10000 });
      const data = response.data;

      // Handle GBPrimePay API response (adjust field names as per real API)
      return {
        transactionId: data.referenceNo || transaction.transactionId,
        paymentUrl: data.qrImageUrl || data.paymentUrl,
        status: data.status || 'pending',
        raw: data,
      };
    } catch (error: any) {
      this.logger.error('GBPrimePay API error', error?.response?.data || error.message);
      throw new BadRequestException('GBPrimePay API error: ' + (error?.response?.data?.message || error.message));
    }
  }

  // Get default fee percentage by payment method type
  private getDefaultFeePercentage(type: ThaiPaymentMethodType): number {
    const fees = {
      [ThaiPaymentMethodType.PROMPTPAY]: 0.5,
      [ThaiPaymentMethodType.KBANK]: 1.0,
      [ThaiPaymentMethodType.SCB_EASY]: 1.0,
      [ThaiPaymentMethodType.TRUEMONEY]: 1.5,
      [ThaiPaymentMethodType.GBPRIMEPAY]: 1.2,
      [ThaiPaymentMethodType.BBL]: 1.0,
      [ThaiPaymentMethodType.OMISE]: 1.5,
      [ThaiPaymentMethodType.C2C2P]: 1.3,
    };

    return fees[type] || 1.0;
  }

  // Get default fixed fee by payment method type
  private getDefaultFeeFixed(type: ThaiPaymentMethodType): number {
    const fees = {
      [ThaiPaymentMethodType.PROMPTPAY]: 0,
      [ThaiPaymentMethodType.KBANK]: 5,
      [ThaiPaymentMethodType.SCB_EASY]: 5,
      [ThaiPaymentMethodType.TRUEMONEY]: 10,
      [ThaiPaymentMethodType.GBPRIMEPAY]: 8,
      [ThaiPaymentMethodType.BBL]: 5,
      [ThaiPaymentMethodType.OMISE]: 10,
      [ThaiPaymentMethodType.C2C2P]: 8,
    };

    return fees[type] || 5;
  }

  // Process payment callback
  async processPaymentCallback(
    transactionId: string,
    status: string,
    providerData: any,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId },
      relations: ['order', 'thaiPaymentMethod'],
    });
    if (!transaction) {
      await this.auditService.log({ action: 'processPaymentCallback', transactionId, status: 'failed', reason: 'Transaction not found' });
      throw new NotFoundException('Transaction not found');
    }
    // Update transaction status
    transaction.status = this.mapProviderStatus(status);
    transaction.processedAt = new Date();
    if (transaction.status === TransactionStatus.COMPLETED) {
      transaction.completedAt = new Date();
      // Update order status
      if (transaction.order) {
        transaction.order.status = OrderStatus.CONFIRMED;
        transaction.order.confirmedAt = new Date();
        await this.orderRepository.save(transaction.order);
      }
    }
    // Update payment method usage stats
    if (transaction.thaiPaymentMethod) {
      transaction.thaiPaymentMethod.usageCount += 1;
      transaction.thaiPaymentMethod.totalVolume += transaction.amount;
      transaction.thaiPaymentMethod.lastUsedAt = new Date();
      await this.thaiPaymentMethodRepository.save(transaction.thaiPaymentMethod);
    }
    const saved = await this.transactionRepository.save(transaction);
    await this.auditService.log({ action: 'processPaymentCallback', transactionId, status: transaction.status, providerData });
    return saved;
  }

  // Map provider status to internal status
  private mapProviderStatus(providerStatus: string): TransactionStatus {
    const statusMap: Record<string, TransactionStatus> = {
      'success': TransactionStatus.COMPLETED,
      'completed': TransactionStatus.COMPLETED,
      'paid': TransactionStatus.COMPLETED,
      'failed': TransactionStatus.FAILED,
      'cancelled': TransactionStatus.CANCELLED,
      'pending': TransactionStatus.PENDING,
      'processing': TransactionStatus.PROCESSING,
    };

    const lowerStatus = providerStatus.toLowerCase();
    return statusMap[lowerStatus] || TransactionStatus.PENDING;
  }

  async getAvailablePaymentMethods(): Promise<ThaiPaymentMethod[]> {
    return this.thaiPaymentMethodRepository.find({
      where: { isEnabled: true },
      order: { createdAt: 'ASC' },
    });
  }

  async getPaymentMethodByProvider(provider: ThaiPaymentMethodType): Promise<ThaiPaymentMethod | null> {
    return this.thaiPaymentMethodRepository.findOne({
      where: { type: provider, isEnabled: true },
    });
  }
}
