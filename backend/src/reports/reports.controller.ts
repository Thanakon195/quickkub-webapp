import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('transactions')
  generateTransactionReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.generateTransactionReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('merchants/:merchantId')
  generateMerchantReport(@Param('merchantId') merchantId: string) {
    return this.reportsService.generateMerchantReport(merchantId);
  }

  @Get('settlements')
  generateSettlementReport() {
    return this.reportsService.generateSettlementReport();
  }

  @Post('export')
  exportReport(@Body() reportData: any, @Query('format') format: string) {
    return this.reportsService.exportReport(reportData, format);
  }
}
