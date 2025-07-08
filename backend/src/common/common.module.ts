import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './controllers/health.controller';
import { WebhookSignatureGuard } from './guards/webhook-signature.guard';
import { EncryptionService } from './services/encryption.service';
import { HealthService } from './services/health.service';

@Module({
  imports: [ConfigModule],
  controllers: [HealthController],
  providers: [HealthService, EncryptionService, WebhookSignatureGuard],
  exports: [HealthService, EncryptionService, WebhookSignatureGuard],
})
export class CommonModule {}
