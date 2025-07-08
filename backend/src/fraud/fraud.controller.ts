import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FraudService } from './fraud.service';

@Controller('fraud')
export class FraudController {
  constructor(private readonly fraudService: FraudService) {}

  @Post('detect')
  detectFraud(@Body() transactionData: any) {
    return this.fraudService.detectFraud(transactionData);
  }

  @Post('block/:transactionId')
  blockTransaction(@Param('transactionId') transactionId: string) {
    return this.fraudService.blockTransaction(transactionId);
  }

  @Post('allow/:transactionId')
  allowTransaction(@Param('transactionId') transactionId: string) {
    return this.fraudService.allowTransaction(transactionId);
  }

  @Get('rules')
  getFraudRules() {
    return {
      rules: [
        { id: 1, name: 'High Amount', threshold: 10000 },
        { id: 2, name: 'High Frequency', threshold: 10 },
        { id: 3, name: 'Location Mismatch', enabled: true },
      ],
    };
  }
}
