import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BusinessMetricsService } from '../services/business-metrics.service';

@ApiTags('Business Metrics')
@Controller('metrics')
export class BusinessMetricsController {
  constructor(private readonly metricsService: BusinessMetricsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get transaction summary metrics' })
  @ApiResponse({ status: 200, description: 'Summary metrics' })
  async getSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.metricsService.getSummaryMetrics({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Get('by-method')
  @ApiOperation({ summary: 'Get metrics by payment method' })
  @ApiResponse({ status: 200, description: 'Metrics by payment method' })
  async getByMethod(@Query('from') from?: string, @Query('to') to?: string) {
    return this.metricsService.getMetricsByPaymentMethod({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Get('settlement-metrics')
  @ApiOperation({ summary: 'Get settlement metrics' })
  @ApiResponse({ status: 200, description: 'Settlement metrics' })
  async getSettlementMetrics(@Query('from') from?: string, @Query('to') to?: string) {
    return this.metricsService.getSettlementMetrics({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Get('export-settlement-metrics')
  @ApiOperation({ summary: 'Export settlement metrics as CSV' })
  @ApiResponse({ status: 200, description: 'CSV file' })
  async exportSettlementMetrics(@Query('from') from: string, @Query('to') to: string, @Res() res: Response) {
    const metrics = await this.metricsService.getSettlementMetrics({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
    const rows = [
      ['merchantId', 'count', 'amount'],
      ...metrics.byMerchant.map(row => [row.merchantId, row.count, row.amount]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="settlement-metrics.csv"');
    res.send(csv);
  }
}
