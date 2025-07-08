import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class NotificationTemplate {
  @PrimaryGeneratedColumn()
  id: number;
}
