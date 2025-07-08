import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { Settlement, SettlementStatus, SettlementType } from './entities/settlement.entity';
import { SettlementsService } from './settlements.service';

@Controller('settlements')
export class SettlementsController {
  constructor(
    private readonly settlementsService: SettlementsService,
    @InjectRepository(Settlement)
    private readonly settlementRepository: Repository<Settlement>,
  ) {}

  @Post()
  create(@Body() createSettlementDto: any) {
    return this.settlementsService.create(createSettlementDto);
  }

  @Post('merchant/:merchantId')
  createByMerchant(
    @Param('merchantId') merchantId: string,
    @Body() body: { from: string; to: string; type?: SettlementType },
  ) {
    return this.settlementsService.createSettlementByMerchant(
      merchantId,
      new Date(body.from),
      new Date(body.to),
      body.type,
    );
  }

  @Get()
  findAll() {
    return this.settlementsService.findAll();
  }

  @Get('merchant/:merchantId')
  async findByMerchant(
    @Param('merchantId') merchantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    const settlements = await this.settlementsService.findByMerchant(
      merchantId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
    if (limit) {
      return settlements.slice(0, parseInt(limit, 10));
    }
    return settlements;
  }

  @Get('summary/:merchantId')
  summary(
    @Param('merchantId') merchantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    if (from && to) {
      return this.settlementsService.summary(
        merchantId,
        new Date(from),
        new Date(to),
      );
    } else if (from) {
      return this.settlementsService.summary(
        merchantId,
        new Date(from),
        undefined,
      );
    } else if (to) {
      return this.settlementsService.summary(
        merchantId,
        undefined,
        new Date(to),
      );
    } else {
      return this.settlementsService.summary(
        merchantId,
        undefined,
        undefined,
      );
    }
  }

  @Get('trend')
  async getTrend(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('interval') interval: 'day' | 'month' = 'day',
    @Query('merchantId') merchantId?: string,
  ) {
    // group by date (day or month)
    const qb = this.settlementRepository.createQueryBuilder('settle');
    if (from) qb.andWhere('settle.createdAt >= :from', { from });
    if (to) qb.andWhere('settle.createdAt <= :to', { to });
    if (merchantId) qb.andWhere('settle.merchant = :merchantId', { merchantId });
    let dateExpr = interval === 'month'
      ? `TO_CHAR(settle.createdAt, 'YYYY-MM')`
      : `TO_CHAR(settle.createdAt, 'YYYY-MM-DD')`;
    const rows = await qb
      .select(`${dateExpr} as date`)
      .addSelect('SUM(settle.netAmount)', 'netAmount')
      .addSelect('COUNT(settle.id)', 'count')
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();
    return rows.map(r => ({
      date: r.date,
      netAmount: Number(r.netAmount),
      count: Number(r.count),
    }));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.settlementsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSettlementDto: any) {
    return this.settlementsService.update(id, updateSettlementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.settlementsService.remove(id);
  }

  @Post(':id/process')
  processSettlement(@Param('id') id: string) {
    return this.settlementsService.processSettlement({ id } as any);
  }

  @Get(':id/export')
  async exportSettlement(@Param('id') id: string, @Res() res: Response) {
    const settlement = await this.settlementRepository.findOne({
      where: { id },
      relations: ['merchant', 'transactions'],
    });
    if (!settlement) {
      return res.status(404).send('Not found');
    }
    const rows = [
      ['Settlement ID', settlement.settlementId || settlement.id],
      ['Merchant', settlement.merchant?.merchantId || '-'],
      ['Type', settlement.type],
      ['Status', settlement.status],
      ['Net Amount', settlement.netAmount],
      ['Transaction Count', settlement.transactionCount],
      ['Created', settlement.createdAt],
      ['Completed', settlement.completedAt || '-'],
      [],
      ['Transaction ID', 'Amount', 'Status', 'Created'],
      ...((settlement.transactions || []).map(tx => [
        tx.transactionId || tx.id,
        tx.amount,
        tx.status,
        tx.createdAt,
      ])),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=settlement-${id}.csv`);
    res.send(csv);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'completed' | 'failed'; failureReason?: string },
  ) {
    const settlement = await this.settlementRepository.findOne({ where: { id } });
    if (!settlement) {
      return { message: 'Not found' };
    }
    if (body.status === 'completed') {
      settlement.status = SettlementStatus.COMPLETED;
      settlement.completedAt = new Date();
      settlement.failureReason = '';
    } else if (body.status === 'failed') {
      settlement.status = SettlementStatus.FAILED;
      settlement.failureReason = body.failureReason || 'Marked as failed by admin';
    }
    await this.settlementRepository.save(settlement);
    return { message: 'Status updated', status: settlement.status };
  }

  @Post(':id/notify')
  async notifyMerchant(@Param('id') id: string) {
    // mock: ใน production ให้เชื่อมกับ email service จริง
    const settlement = await this.settlementRepository.findOne({
      where: { id },
      relations: ['merchant', 'merchant.user'],
    });
    if (!settlement || !settlement.merchant) {
      return { message: 'Not found' };
    }
    // ใช้ email จาก settings.notificationEmail หรือ user.email หรือ merchantId
    const email = settlement.merchant.settings?.notificationEmail || settlement.merchant.user?.email || settlement.merchant.merchantId + '@example.com';
    // log หรือส่งอีเมลจริงที่นี่
    console.log(`Send settlement notification to ${email} for settlement ${id}`);
    return { message: `Notification sent to ${email}` };
  }
}
