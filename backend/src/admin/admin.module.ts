import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditService } from './services/audit.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AuditService],
  exports: [AdminService, AuditService],
})
export class AdminModule {}
