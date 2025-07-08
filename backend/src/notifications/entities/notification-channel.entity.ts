import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class NotificationChannel {
  @PrimaryGeneratedColumn()
  id: number;
}
