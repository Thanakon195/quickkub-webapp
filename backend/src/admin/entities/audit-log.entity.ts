import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;
}
