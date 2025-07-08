import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';
import { ThaiPaymentService } from './services/thai-payment.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentRepository: Repository<Payment>;
  let thaiPaymentService: ThaiPaymentService;

  const mockPaymentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockThaiPaymentService = {
    createPromptPayPayment: jest.fn(),
    createKBankPayment: jest.fn(),
    createSCBEasyPayment: jest.fn(),
    createTrueMoneyPayment: jest.fn(),
    createGBPrimePayPayment: jest.fn(),
    getAvailablePaymentMethods: jest.fn(),
    getPaymentMethodByProvider: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepository,
        },
        {
          provide: ThaiPaymentService,
          useValue: mockThaiPaymentService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    paymentRepository = module.get<Repository<Payment>>(getRepositoryToken(Payment));
    thaiPaymentService = module.get<ThaiPaymentService>(ThaiPaymentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('createPayment', () => {
  //   ...
  // });

  // describe('getPayment', () => {
  //   ...
  // });

  // describe('updatePaymentStatus', () => {
  //   ...
  // });

  // describe('getPaymentsByMerchant', () => {
  //   ...
  // });

  // describe('getPaymentStatistics', () => {
  //   ...
  // });

  // describe('processRefund', () => {
  //   ...
  // });
});
