import { DataSource } from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { ThaiPaymentMethod, ThaiPaymentMethodStatus, ThaiPaymentMethodType } from '../../payments/entities/thai-payment-method.entity';

export const seedThaiPaymentMethods = async (dataSource: DataSource) => {
  const thaiPaymentMethodRepository = dataSource.getRepository(ThaiPaymentMethod);
  const merchantRepository = dataSource.getRepository(Merchant);

  // Get first merchant for seeding
  const merchant = await merchantRepository.findOne({ where: {} });
  if (!merchant) {
    console.log('No merchant found, skipping Thai payment methods seed');
    return;
  }

  const paymentMethods = [
    {
      merchantId: merchant.id,
      type: ThaiPaymentMethodType.PROMPTPAY,
      status: ThaiPaymentMethodStatus.ACTIVE,
      name: 'PromptPay QR Code',
      description: 'ชำระเงินผ่าน PromptPay QR Code',
      config: {
        promptPayId: '0812345678',
        sandbox: true,
      },
      limits: {
        minAmount: 1,
        maxAmount: 100000,
        dailyLimit: 1000000,
        monthlyLimit: 10000000,
        currency: 'THB',
      },
      feePercentage: 0.5,
      feeFixed: 0,
      isEnabled: true,
      isDefault: true,
      priority: 1,
      metadata: {
        logo: '/images/payment-methods/promptpay.png',
        icon: 'qr-code',
        color: '#00A651',
        supportedCurrencies: ['THB'],
        processingTime: '1-2 minutes',
      },
    },
    {
      merchantId: merchant.id,
      type: ThaiPaymentMethodType.KBANK,
      status: ThaiPaymentMethodStatus.ACTIVE,
      name: 'KBank Online Banking',
      description: 'ชำระเงินผ่าน KBank Online Banking',
      config: {
        apiKey: 'kbank_test_api_key',
        secretKey: 'kbank_test_secret_key',
        merchantId: 'TEST_MERCHANT_001',
        sandbox: true,
      },
      limits: {
        minAmount: 1,
        maxAmount: 50000,
        dailyLimit: 500000,
        monthlyLimit: 5000000,
        currency: 'THB',
      },
      feePercentage: 1.0,
      feeFixed: 5,
      isEnabled: true,
      isDefault: false,
      priority: 2,
      metadata: {
        logo: '/images/payment-methods/kbank.png',
        icon: 'bank',
        color: '#1E3A8A',
        supportedCurrencies: ['THB'],
        processingTime: '2-3 minutes',
      },
    },
    {
      merchantId: merchant.id,
      type: ThaiPaymentMethodType.SCB_EASY,
      status: ThaiPaymentMethodStatus.ACTIVE,
      name: 'SCB Easy App',
      description: 'ชำระเงินผ่าน SCB Easy App',
      config: {
        apiKey: 'scb_test_api_key',
        secretKey: 'scb_test_secret_key',
        merchantId: 'TEST_MERCHANT_002',
        sandbox: true,
      },
      limits: {
        minAmount: 1,
        maxAmount: 50000,
        dailyLimit: 500000,
        monthlyLimit: 5000000,
        currency: 'THB',
      },
      feePercentage: 1.0,
      feeFixed: 5,
      isEnabled: true,
      isDefault: false,
      priority: 3,
      metadata: {
        logo: '/images/payment-methods/scb.png',
        icon: 'smartphone',
        color: '#4F46E5',
        supportedCurrencies: ['THB'],
        processingTime: '1-2 minutes',
      },
    },
    {
      merchantId: merchant.id,
      type: ThaiPaymentMethodType.TRUEMONEY,
      status: ThaiPaymentMethodStatus.ACTIVE,
      name: 'TrueMoney Wallet',
      description: 'ชำระเงินผ่าน TrueMoney Wallet',
      config: {
        apiKey: 'truemoney_test_api_key',
        secretKey: 'truemoney_test_secret_key',
        merchantId: 'TEST_MERCHANT_003',
        sandbox: true,
      },
      limits: {
        minAmount: 1,
        maxAmount: 20000,
        dailyLimit: 200000,
        monthlyLimit: 2000000,
        currency: 'THB',
      },
      feePercentage: 1.5,
      feeFixed: 10,
      isEnabled: true,
      isDefault: false,
      priority: 4,
      metadata: {
        logo: '/images/payment-methods/truemoney.png',
        icon: 'wallet',
        color: '#DC2626',
        supportedCurrencies: ['THB'],
        processingTime: '1-2 minutes',
      },
    },
    {
      merchantId: merchant.id,
      type: ThaiPaymentMethodType.GBPRIMEPAY,
      status: ThaiPaymentMethodStatus.ACTIVE,
      name: 'GBPrimePay',
      description: 'ชำระเงินผ่าน GBPrimePay',
      config: {
        apiKey: 'gbprimepay_test_api_key',
        secretKey: 'gbprimepay_test_secret_key',
        merchantId: 'TEST_MERCHANT_004',
        sandbox: true,
      },
      limits: {
        minAmount: 1,
        maxAmount: 100000,
        dailyLimit: 1000000,
        monthlyLimit: 10000000,
        currency: 'THB',
      },
      feePercentage: 1.2,
      feeFixed: 8,
      isEnabled: true,
      isDefault: false,
      priority: 5,
      metadata: {
        logo: '/images/payment-methods/gbprimepay.png',
        icon: 'credit-card',
        color: '#059669',
        supportedCurrencies: ['THB'],
        processingTime: '2-3 minutes',
      },
    },
    {
      merchantId: merchant.id,
      type: ThaiPaymentMethodType.BBL,
      status: ThaiPaymentMethodStatus.ACTIVE,
      name: 'BBL iBanking',
      description: 'ชำระเงินผ่าน BBL iBanking',
      config: {
        apiKey: 'bbl_test_api_key',
        secretKey: 'bbl_test_secret_key',
        merchantId: 'TEST_MERCHANT_005',
        sandbox: true,
      },
      limits: {
        minAmount: 1,
        maxAmount: 50000,
        dailyLimit: 500000,
        monthlyLimit: 5000000,
        currency: 'THB',
      },
      feePercentage: 1.0,
      feeFixed: 5,
      isEnabled: true,
      isDefault: false,
      priority: 6,
      metadata: {
        logo: '/images/payment-methods/bbl.png',
        icon: 'bank',
        color: '#1E40AF',
        supportedCurrencies: ['THB'],
        processingTime: '2-3 minutes',
      },
    },
    {
      merchantId: merchant.id,
      type: ThaiPaymentMethodType.OMISE,
      status: ThaiPaymentMethodStatus.ACTIVE,
      name: 'Omise',
      description: 'ชำระเงินผ่าน Omise',
      config: {
        apiKey: 'omise_test_api_key',
        secretKey: 'omise_test_secret_key',
        merchantId: 'TEST_MERCHANT_006',
        sandbox: true,
      },
      limits: {
        minAmount: 1,
        maxAmount: 100000,
        dailyLimit: 1000000,
        monthlyLimit: 10000000,
        currency: 'THB',
      },
      feePercentage: 1.5,
      feeFixed: 10,
      isEnabled: true,
      isDefault: false,
      priority: 7,
      metadata: {
        logo: '/images/payment-methods/omise.png',
        icon: 'credit-card',
        color: '#7C3AED',
        supportedCurrencies: ['THB'],
        processingTime: '2-3 minutes',
      },
    },
    {
      merchantId: merchant.id,
      type: ThaiPaymentMethodType.C2C2P,
      status: ThaiPaymentMethodStatus.ACTIVE,
      name: '2C2P',
      description: 'ชำระเงินผ่าน 2C2P',
      config: {
        apiKey: '2c2p_test_api_key',
        secretKey: '2c2p_test_secret_key',
        merchantId: 'TEST_MERCHANT_007',
        sandbox: true,
      },
      limits: {
        minAmount: 1,
        maxAmount: 100000,
        dailyLimit: 1000000,
        monthlyLimit: 10000000,
        currency: 'THB',
      },
      feePercentage: 1.3,
      feeFixed: 8,
      isEnabled: true,
      isDefault: false,
      priority: 8,
      metadata: {
        logo: '/images/payment-methods/2c2p.png',
        icon: 'credit-card',
        color: '#EA580C',
        supportedCurrencies: ['THB'],
        processingTime: '2-3 minutes',
      },
    },
  ];

  for (const paymentMethodData of paymentMethods) {
    const existingPaymentMethod = await thaiPaymentMethodRepository.findOne({
      where: {
        merchantId: paymentMethodData.merchantId,
        type: paymentMethodData.type,
      },
    });

    if (!existingPaymentMethod) {
      const paymentMethod = thaiPaymentMethodRepository.create(paymentMethodData);
      await thaiPaymentMethodRepository.save(paymentMethod);
      console.log(`Created Thai payment method: ${paymentMethod.name}`);
    } else {
      console.log(`Thai payment method already exists: ${paymentMethodData.name}`);
    }
  }

  console.log('Thai payment methods seeding completed');
};
