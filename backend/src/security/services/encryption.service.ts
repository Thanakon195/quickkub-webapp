import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  constructor(private configService: ConfigService) {}

  encrypt(text: string): string {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, key);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Combine IV, encrypted data, and auth tag
    return iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex');
  }

  decrypt(encryptedData: string): string {
    const key = this.getEncryptionKey();
    const parts = encryptedData.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const tag = Buffer.from(parts[2], 'hex');

    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return salt + ':' + hash;
  }

  verifyPassword(password: string, hashedPassword: string): boolean {
    const parts = hashedPassword.split(':');
    if (parts.length !== 2) {
      return false;
    }

    const salt = parts[0];
    const hash = parts[1];
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  }

  generateApiKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  generateApiSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  generateWebhookSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private getEncryptionKey(): string {
    const secret = this.configService.get<string>('ENCRYPTION_KEY');
    if (!secret) {
      throw new Error('ENCRYPTION_KEY is not configured');
    }

    // Derive a consistent key from the secret
    return crypto.pbkdf2Sync(secret, 'quickkub-salt', 10000, this.keyLength, 'sha512').toString('hex');
  }
}
