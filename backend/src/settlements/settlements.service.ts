import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settlement, SettlementType } from './entities/settlement.entity';
import { SettlementService } from './services/settlement.service';

@Injectable()
export class SettlementsService {
  constructor(
    @InjectRepository(Settlement)
    private readonly settlementRepository: Repository<Settlement>,
    private readonly settlementService: SettlementService,
  ) {}

  async create(settlement: Omit<Settlement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Settlement> {
    // สำหรับ legacy, ควรใช้ createSettlement ใหม่
    return await this.settlementRepository.save(settlement);
  }

  async createSettlementByMerchant(merchantId: string, from: Date, to: Date, type: SettlementType = SettlementType.DAILY) {
    return this.settlementService.createSettlement(merchantId, from, to, type);
  }

  async findAll(): Promise<Settlement[]> {
    return await this.settlementRepository.find();
  }

  async findOne(id: string): Promise<Settlement | null> {
    return await this.settlementRepository.findOne({ where: { id } });
  }

  async findByMerchant(merchantId: string, from?: Date, to?: Date) {
    return this.settlementService.getSettlements(merchantId, from, to);
  }

  async update(id: string, settlement: Partial<Settlement>): Promise<Settlement> {
    await this.settlementRepository.update(id, settlement);
    const updatedSettlement = await this.findOne(id);
    if (!updatedSettlement) {
      throw new NotFoundException(`Settlement with ID ${id} not found`);
    }
    return updatedSettlement;
  }

  async remove(id: string): Promise<void> {
    await this.settlementRepository.delete(id);
  }

  async processSettlement(settlement: Settlement): Promise<void> {
    // Implementation for processing settlement
    await this.settlementService.completeSettlement(settlement.id);
  }

  async summary(merchantId: string, from?: Date, to?: Date) {
    return this.settlementService.calculateSettlement(merchantId, from, to);
  }

  // TODO: เพิ่ม export/report logic ตามต้องการ
}
