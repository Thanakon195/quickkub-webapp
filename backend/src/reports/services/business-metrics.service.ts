import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThaiPaymentMethodType } from '../../payments/entities/thai-payment-method.entity';
import { Settlement, SettlementStatus } from '../../settlements/entities/settlement.entity';
import { Transaction, TransactionStatus } from '../../transactions/entities/transaction.entity';

@Injectable()
export class BusinessMetricsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Settlement)
    private readonly settlementRepository: Repository<Settlement>,
  ) {}

  async getSummaryMetrics({ from, to }: { from?: Date; to?: Date }) {
    const qb = this.transactionRepository.createQueryBuilder('txn');
    if (from) qb.andWhere('txn.createdAt >= :from', { from });
    if (to) qb.andWhere('txn.createdAt <= :to', { to });

    const total = await qb.getCount();
    const totalAmount = await qb.select('SUM(txn.amount)', 'sum').getRawOne();
    const success = await qb.andWhere('txn.status = :status', { status: TransactionStatus.COMPLETED }).getCount();
    const failed = await qb.andWhere('txn.status = :status', { status: TransactionStatus.FAILED }).getCount();

    return {
      totalTransactions: total,
      totalAmount: Number(totalAmount.sum || 0),
      successCount: success,
      failedCount: failed,
      successRate: total ? (success / total) * 100 : 0,
      errorRate: total ? (failed / total) * 100 : 0,
    };
  }

  async getMetricsByPaymentMethod({ from, to }: { from?: Date; to?: Date }) {
    const qb = this.transactionRepository.createQueryBuilder('txn')
      .leftJoin('txn.thaiPaymentMethod', 'method');
    if (from) qb.andWhere('txn.createdAt >= :from', { from });
    if (to) qb.andWhere('txn.createdAt <= :to', { to });

    const rows = await qb
      .select('method.type', 'type')
      .addSelect('COUNT(txn.id)', 'count')
      .addSelect('SUM(txn.amount)', 'amount')
      .groupBy('method.type')
      .getRawMany();

    return rows.map(row => ({
      type: row.type as ThaiPaymentMethodType,
      count: Number(row.count),
      amount: Number(row.amount),
    }));
  }

  async getSettlementMetrics({ from, to }: { from?: Date; to?: Date }) {
    const qb = this.settlementRepository.createQueryBuilder('settle')
      .leftJoin('settle.merchant', 'merchant');
    if (from) qb.andWhere('settle.createdAt >= :from', { from });
    if (to) qb.andWhere('settle.createdAt <= :to', { to });

    const total = await qb.getCount();
    const totalAmount = await qb.select('SUM(settle.netAmount)', 'sum').getRawOne();
    const completed = await qb.andWhere('settle.status = :status', { status: SettlementStatus.COMPLETED }).getCount();
    const failed = await qb.andWhere('settle.status = :status', { status: SettlementStatus.FAILED }).getCount();

    const byMerchant = await qb
      .select('merchant.merchantId', 'merchantId')
      .addSelect('COUNT(settle.id)', 'count')
      .addSelect('SUM(settle.netAmount)', 'amount')
      .groupBy('merchant.merchantId')
      .getRawMany();

    return {
      totalSettlements: total,
      totalNetAmount: Number(totalAmount.sum || 0),
      completedCount: completed,
      failedCount: failed,
      completedRate: total ? (completed / total) * 100 : 0,
      failedRate: total ? (failed / total) * 100 : 0,
      byMerchant: byMerchant.map(row => ({
        merchantId: row.merchantId,
        count: Number(row.count),
        amount: Number(row.amount),
      })),
    };
  }
}
