import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ReportSchedule {
  @PrimaryGeneratedColumn()
  id: number;
}
