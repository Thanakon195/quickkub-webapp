import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Settlement } from './entities/settlement.entity';
import { SettlementService } from './services/settlement.service';
import { SettlementsService } from './settlements.service';

// Mock Currency enum เพื่อหลีกเลี่ยง error dependency
jest.mock('../transactions/entities/transaction.entity', () => ({
  Currency: { THB: 'THB' },
  TransactionStatus: {},
}));

const mockSettlementService = {
  calculateSettlement: jest.fn().mockResolvedValue({
    merchant: { id: 'merchant-1' },
    from: new Date('2024-01-01'),
    to: new Date('2024-01-31'),
    transactionCount: 2,
    totalAmount: 1000,
    totalFee: 30,
    netAmount: 970,
    transactions: [{ id: 'tx1' }, { id: 'tx2' }],
  }),
  createSettlement: jest.fn().mockResolvedValue({ id: 'settle-1' }),
  getSettlements: jest.fn().mockResolvedValue([{ id: 'settle-1' }]),
  completeSettlement: jest.fn().mockResolvedValue({ id: 'settle-1', status: 'completed' }),
};

const mockRepo = () => ({
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('SettlementsService', () => {
  let service: SettlementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettlementsService,
        { provide: SettlementService, useValue: mockSettlementService },
        { provide: getRepositoryToken(Settlement), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<SettlementsService>(SettlementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get summary', async () => {
    const summary = await service.summary('merchant-1', new Date('2024-01-01'), new Date('2024-01-31'));
    expect(summary.totalAmount).toBe(1000);
    expect(mockSettlementService.calculateSettlement).toHaveBeenCalled();
  });

  it('should create settlement by merchant', async () => {
    const result = await service.createSettlementByMerchant('merchant-1', new Date('2024-01-01'), new Date('2024-01-31'));
    expect(result.id).toBe('settle-1');
    expect(mockSettlementService.createSettlement).toHaveBeenCalled();
  });

  it('should find settlements by merchant', async () => {
    const result = await service.findByMerchant('merchant-1');
    expect(result[0].id).toBe('settle-1');
    expect(mockSettlementService.getSettlements).toHaveBeenCalled();
  });

  it('should complete settlement', async () => {
    const result = await service.processSettlement({ id: 'settle-1' } as any);
    expect(mockSettlementService.completeSettlement).toHaveBeenCalledWith('settle-1');
  });
});
