import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Settlement } from '../settlements/entities/settlement.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { BusinessMetricsController } from './controllers/business-metrics.controller';
import { BusinessMetricsService } from './services/business-metrics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Settlement])],
  controllers: [BusinessMetricsController],
  providers: [BusinessMetricsService],
  exports: [BusinessMetricsService],
})
export class ReportsModule {}
