import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { ThaiPaymentController } from './controllers/thai-payment.controller';
import { Order } from './entities/order.entity';
import { Payment } from './entities/payment.entity';
import { ThaiPaymentMethod } from './entities/thai-payment-method.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ThaiPaymentService } from './services/thai-payment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      ThaiPaymentMethod,
      Transaction,
      Order,
      Merchant,
    ]),
  ],
  controllers: [PaymentsController, ThaiPaymentController],
  providers: [PaymentsService, ThaiPaymentService],
  exports: [PaymentsService, ThaiPaymentService],
})
export class PaymentsModule {}
