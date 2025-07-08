import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    NotFoundException,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { WebhookSignatureGuard } from '../../common/guards/webhook-signature.guard';
import { UserRole } from '../../users/entities/user.entity';
import { ThaiPaymentMethod, ThaiPaymentMethodType } from '../entities/thai-payment-method.entity';
import { ThaiPaymentService } from '../services/thai-payment.service';

@ApiTags('Thai Payment Methods')
@Controller('thai-payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ThaiPaymentController {
  private readonly logger = new Logger(ThaiPaymentController.name);

  constructor(private readonly thaiPaymentService: ThaiPaymentService) {}

  @Post('methods')
  @Roles(UserRole.MERCHANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create Thai payment method for merchant' })
  @ApiResponse({ status: 201, description: 'Payment method created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  async createPaymentMethod(
    @Body() createDto: {
      merchantId: string;
      type: ThaiPaymentMethodType;
      config: any;
      name: string;
      description?: string;
    },
  ): Promise<ThaiPaymentMethod> {
    return this.thaiPaymentService.createPaymentMethod(
      createDto.merchantId,
      createDto.type,
      createDto.config,
      createDto.name,
      createDto.description,
    );
  }

  @Get('methods/merchant/:merchantId')
  @Roles(UserRole.MERCHANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get payment methods for merchant' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  async getPaymentMethods(@Param('merchantId') merchantId: string): Promise<ThaiPaymentMethod[]> {
    return this.thaiPaymentService.getPaymentMethods(merchantId);
  }

  @Get('methods/available')
  @ApiOperation({ summary: 'Get all available payment methods' })
  @ApiResponse({ status: 200, description: 'Available payment methods retrieved successfully' })
  async getAvailablePaymentMethods(): Promise<ThaiPaymentMethod[]> {
    return this.thaiPaymentService.getAvailablePaymentMethods();
  }

  @Post('request')
  @Roles(UserRole.MERCHANT, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate payment request' })
  @ApiResponse({ status: 200, description: 'Payment request generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Order or payment method not found' })
  async generatePaymentRequest(
    @Body() requestDto: {
      orderId: string;
      paymentMethodId: string;
      amount: number;
      currency?: string;
    },
  ): Promise<any> {
    if (!requestDto.orderId || !requestDto.paymentMethodId || !requestDto.amount) {
      throw new BadRequestException('orderId, paymentMethodId, and amount are required');
    }

    if (requestDto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    return this.thaiPaymentService.generatePaymentRequest(
      requestDto.orderId,
      requestDto.paymentMethodId,
      requestDto.amount,
      requestDto.currency as any,
    );
  }

  @Post('callback/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process payment callback from provider' })
  @ApiResponse({ status: 200, description: 'Callback processed successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async processCallback(
    @Param('provider') provider: string,
    @Body() callbackData: {
      transactionId: string;
      status: string;
      [key: string]: any;
    },
  ): Promise<any> {
    if (!callbackData.transactionId || !callbackData.status) {
      throw new BadRequestException('transactionId and status are required');
    }

    const transaction = await this.thaiPaymentService.processPaymentCallback(
      callbackData.transactionId,
      callbackData.status,
      callbackData,
    );

    return {
      success: true,
      transactionId: transaction.transactionId,
      status: transaction.status,
      message: 'Callback processed successfully',
    };
  }

  @Get('methods/provider/:provider')
  @ApiOperation({ summary: 'Get payment method by provider type' })
  @ApiResponse({ status: 200, description: 'Payment method retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async getPaymentMethodByProvider(
    @Param('provider') provider: ThaiPaymentMethodType,
  ): Promise<ThaiPaymentMethod | null> {
    const paymentMethod = await this.thaiPaymentService.getPaymentMethodByProvider(provider);
    if (!paymentMethod) {
      throw new NotFoundException(`Payment method for provider ${provider} not found`);
    }
    return paymentMethod;
  }

  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook endpoint for payment providers' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @UseGuards(WebhookSignatureGuard)
  async processWebhook(
    @Param('provider') provider: string,
    @Body() webhookData: any,
    @Query() query: any,
  ): Promise<any> {
    try {
      // In production, verify webhook signature here (guard)
      const transactionId = webhookData.transactionId || webhookData.reference || webhookData.orderId;
      const status = webhookData.status || webhookData.paymentStatus || webhookData.result;

      if (!transactionId || !status) {
        throw new BadRequestException('Invalid webhook data: missing transactionId or status');
      }

      const transaction = await this.thaiPaymentService.processPaymentCallback(
        transactionId,
        status,
        webhookData,
      );

      return {
        success: true,
        transactionId: transaction.transactionId,
        status: transaction.status,
      };
    } catch (error) {
      this.logger?.error?.('Webhook processing error', error);
      throw error;
    }
  }

  private validateWebhookSignature(provider: string, data: any, query: any): void {
    // In production, implement proper webhook signature validation
    // This is a placeholder for security implementation
    const signature = query.signature || data.signature;
    if (!signature) {
      throw new BadRequestException('Missing webhook signature');
    }

    // Validate signature based on provider
    switch (provider.toLowerCase()) {
      case 'kbank':
        this.validateKBankSignature(data, signature);
        break;
      case 'scb':
        this.validateSCBSignature(data, signature);
        break;
      case 'truemoney':
        this.validateTrueMoneySignature(data, signature);
        break;
      case 'gbprimepay':
        this.validateGBPrimePaySignature(data, signature);
        break;
      default:
        // For other providers, implement their specific validation
        break;
    }
  }

  private validateKBankSignature(data: any, signature: string): void {
    // Implement KBank webhook signature validation
    // This is a placeholder
  }

  private validateSCBSignature(data: any, signature: string): void {
    // Implement SCB webhook signature validation
    // This is a placeholder
  }

  private validateTrueMoneySignature(data: any, signature: string): void {
    // Implement TrueMoney webhook signature validation
    // This is a placeholder
  }

  private validateGBPrimePaySignature(data: any, signature: string): void {
    // Implement GBPrimePay webhook signature validation
    // This is a placeholder
  }
}
