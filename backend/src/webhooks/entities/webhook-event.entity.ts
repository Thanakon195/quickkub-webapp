import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class WebhookEvent {
  @PrimaryGeneratedColumn()
  id: number;
}
