import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from './entities/webhook.entity';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepository: Repository<Webhook>,
  ) {}

  async create(webhook: Omit<Webhook, 'id' | 'createdAt' | 'updatedAt'>): Promise<Webhook> {
    return await this.webhookRepository.save(webhook);
  }

  async findAll(): Promise<Webhook[]> {
    return await this.webhookRepository.find();
  }

  async findOne(id: string): Promise<Webhook | null> {
    return await this.webhookRepository.findOne({ where: { id } });
  }

  async update(id: string, webhook: Partial<Webhook>): Promise<Webhook> {
    await this.webhookRepository.update(id, webhook);
    const updatedWebhook = await this.findOne(id);
    if (!updatedWebhook) {
      throw new NotFoundException(`Webhook with ID ${id} not found`);
    }
    return updatedWebhook;
  }

  async remove(id: string): Promise<void> {
    await this.webhookRepository.delete(id);
  }

  async sendWebhook(webhook: Webhook, payload: any): Promise<void> {
    // Implementation for sending webhook
    console.log(`Sending webhook to ${webhook.url}`, payload);
  }
}
