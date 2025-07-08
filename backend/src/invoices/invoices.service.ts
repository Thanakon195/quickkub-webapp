import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async create(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    return await this.invoiceRepository.save(invoice);
  }

  async findAll(): Promise<Invoice[]> {
    return await this.invoiceRepository.find();
  }

  async findOne(id: string): Promise<Invoice | null> {
    return await this.invoiceRepository.findOne({ where: { id } });
  }

  async update(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    await this.invoiceRepository.update(id, invoice);
    const updatedInvoice = await this.findOne(id);
    if (!updatedInvoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return updatedInvoice;
  }

  async remove(id: string): Promise<void> {
    await this.invoiceRepository.delete(id);
  }
}
