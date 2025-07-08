import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  create(@Body() createWebhookDto: any) {
    return this.webhooksService.create(createWebhookDto);
  }

  @Get()
  findAll() {
    return this.webhooksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.webhooksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWebhookDto: any) {
    return this.webhooksService.update(id, updateWebhookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.webhooksService.remove(id);
  }

  @Post(':id/trigger')
  triggerWebhook(@Param('id') id: string, @Body() payload: any) {
    return this.webhooksService.sendWebhook({ id } as any, payload);
  }
}
