import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class WebhookDelivery {
  @PrimaryGeneratedColumn()
  id: number;
}
