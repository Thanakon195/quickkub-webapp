import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { SettlementAuditLog } from './entities/settlement-audit-log.entity';
import { Settlement } from './entities/settlement.entity';
import { SettlementService } from './services/settlement.service';
import { SettlementsController } from './settlements.controller';
import { SettlementsService } from './settlements.service';

@Module({
  imports: [TypeOrmModule.forFeature([Settlement, Transaction, Merchant, SettlementAuditLog])],
  controllers: [SettlementsController],
  providers: [SettlementsService, SettlementService],
  exports: [SettlementsService],
})
export class SettlementsModule {}
