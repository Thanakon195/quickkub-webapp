import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditService {
  async log(data: any): Promise<void> {
    // Implementation for audit logging
    console.log('Audit log:', data);
  }
}
