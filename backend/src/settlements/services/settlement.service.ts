import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Currency, Transaction, TransactionStatus } from '../../transactions/entities/transaction.entity';
import { Settlement, SettlementStatus, SettlementType } from '../entities/settlement.entity';

@Injectable()
export class SettlementService {
  constructor(
    @InjectRepository(Settlement)
    private readonly settlementRepository: Repository<Settlement>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
  ) {}

  async calculateSettlement(merchantId: string, from?: Date, to?: Date) {
    const merchant = await this.merchantRepository.findOne({ where: { id: merchantId } });
    if (!merchant) throw new Error('Merchant not found');

    let where: any = {
      merchant: { id: merchantId },
      status: TransactionStatus.COMPLETED,
    };
    if (from && to) {
      where.createdAt = Between(from, to);
    } else if (from) {
      where.createdAt = Between(from, new Date());
    } else if (to) {
      where.createdAt = Between(new Date(0), to);
    }

    const transactions = await this.transactionRepository.find({ where });

    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalFee = transactions.reduce((sum, t) => sum + Number(t.fee || 0), 0);
    const netAmount = totalAmount - totalFee;

    return {
      merchant,
      from,
      to,
      transactionCount: transactions.length,
      totalAmount,
      totalFee,
      netAmount,
      transactions,
    };
  }

  async createSettlement(merchantId: string, from: Date, to: Date, type: SettlementType = SettlementType.DAILY) {
    const summary = await this.calculateSettlement(merchantId, from, to);
    const settlement = this.settlementRepository.create({
      settlementId: `SETTLE-${merchantId}-${from.getTime()}-${to.getTime()}`,
      status: SettlementStatus.PENDING,
      type,
      amount: summary.totalAmount,
      currency: Currency.THB,
      fee: summary.totalFee,
      netAmount: summary.netAmount,
      transactionCount: summary.transactionCount,
      merchant: summary.merchant,
      transactions: summary.transactions,
      metadata: { from, to },
    });
    return this.settlementRepository.save(settlement);
  }

  async getSettlements(merchantId: string, from?: Date, to?: Date) {
    const where: any = { merchant: { id: merchantId } };
    if (from && to) where.createdAt = Between(from, to);
    return this.settlementRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async completeSettlement(settlementId: string) {
    const settlement = await this.settlementRepository.findOne({ where: { id: settlementId } });
    if (!settlement) throw new Error('Settlement not found');
    settlement.status = SettlementStatus.COMPLETED;
    settlement.completedAt = new Date();
    return this.settlementRepository.save(settlement);
  }
}
