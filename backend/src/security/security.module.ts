import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookSignatureGuard } from './guards/webhook-signature.guard';
import { EncryptionService } from './services/encryption.service';

@Module({
  imports: [ConfigModule],
  providers: [EncryptionService, WebhookSignatureGuard],
  exports: [EncryptionService, WebhookSignatureGuard],
})
export class SecurityModule {}
