import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ReportTemplate {
  @PrimaryGeneratedColumn()
  id: number;
}
