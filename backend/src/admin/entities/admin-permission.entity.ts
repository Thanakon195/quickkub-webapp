import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AdminPermission {
  @PrimaryGeneratedColumn()
  id: number;
}
