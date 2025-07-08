import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipher, createDecipher, createHash, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 64;
  private readonly tagLength = 16;

  constructor(private configService: ConfigService) {}

  /**
   * Encrypt sensitive data
   */
  async encrypt(data: string): Promise<string> {
    const salt = randomBytes(this.saltLength);
    const iv = randomBytes(this.ivLength);
    const key = await this.deriveKey(salt);

    const cipher = createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('QuickKub Payment Gateway', 'utf8'));

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Combine salt + iv + tag + encrypted data
    const result = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]);
    return result.toString('base64');
  }

  /**
   * Decrypt sensitive data
   */
  async decrypt(encryptedData: string): Promise<string> {
    const buffer = Buffer.from(encryptedData, 'base64');

    // Extract components
    const salt = buffer.subarray(0, this.saltLength);
    const iv = buffer.subarray(this.saltLength, this.saltLength + this.ivLength);
    const tag = buffer.subarray(this.saltLength + this.ivLength, this.saltLength + this.ivLength + this.tagLength);
    const encrypted = buffer.subarray(this.saltLength + this.ivLength + this.tagLength);

    const key = await this.deriveKey(salt);

    const decipher = createDecipher(this.algorithm, key);
    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from('QuickKub Payment Gateway', 'utf8'));

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash sensitive data (one-way)
   */
  hash(data: string, salt?: string): { hash: string; salt: string } {
    const generatedSalt = salt || randomBytes(32).toString('hex');
    const hash = createHash('sha256')
      .update(data + generatedSalt)
      .digest('hex');

    return { hash, salt: generatedSalt };
  }

  /**
   * Verify hashed data
   */
  verifyHash(data: string, hash: string, salt: string): boolean {
    const { hash: expectedHash } = this.hash(data, salt);
    return hash === expectedHash;
  }

  /**
   * Generate secure random string
   */
  generateSecureString(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Encrypt API keys and sensitive config
   */
  async encryptApiKey(apiKey: string, provider: string): Promise<string> {
    const data = JSON.stringify({
      apiKey,
      provider,
      timestamp: Date.now(),
    });

    return this.encrypt(data);
  }

  /**
   * Decrypt API keys and sensitive config
   */
  async decryptApiKey(encryptedApiKey: string): Promise<{ apiKey: string; provider: string; timestamp: number }> {
    const decrypted = await this.decrypt(encryptedApiKey);
    return JSON.parse(decrypted);
  }

  /**
   * Encrypt payment method configuration
   */
  async encryptPaymentConfig(config: any): Promise<string> {
    const sensitiveFields = ['apiKey', 'secretKey', 'privateKey', 'password'];
    const encryptedConfig = { ...config };

    for (const field of sensitiveFields) {
      if (encryptedConfig[field]) {
        encryptedConfig[field] = await this.encrypt(encryptedConfig[field]);
      }
    }

    return JSON.stringify(encryptedConfig);
  }

  /**
   * Decrypt payment method configuration
   */
  async decryptPaymentConfig(encryptedConfig: string): Promise<any> {
    const config = JSON.parse(encryptedConfig);
    const sensitiveFields = ['apiKey', 'secretKey', 'privateKey', 'password'];

    for (const field of sensitiveFields) {
      if (config[field] && typeof config[field] === 'string') {
        try {
          config[field] = await this.decrypt(config[field]);
        } catch (error) {
          // If decryption fails, assume it's already decrypted
          console.warn(`Failed to decrypt ${field}, assuming already decrypted`);
        }
      }
    }

    return config;
  }

  /**
   * Generate HMAC signature for webhooks
   */
  generateWebhookSignature(payload: string, secret: string, algorithm: string = 'sha256'): string {
    const hmac = createHash(algorithm);
    hmac.update(payload + secret);
    return hmac.digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string, algorithm: string = 'sha256'): boolean {
    const expectedSignature = this.generateWebhookSignature(payload, secret, algorithm);
    return this.constantTimeCompare(signature, expectedSignature);
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Derive encryption key from master key and salt
   */
  private async deriveKey(salt: Buffer): Promise<Buffer> {
    const masterKey = this.configService.get<string>('ENCRYPTION_MASTER_KEY');
    if (!masterKey) {
      throw new Error('ENCRYPTION_MASTER_KEY not configured');
    }

    const scryptAsync = promisify(scrypt);
    return scryptAsync(masterKey, salt, this.keyLength) as Promise<Buffer>;
  }

  /**
   * Generate secure token for API authentication
   */
  generateApiToken(merchantId: string, permissions: string[]): string {
    const payload = {
      merchantId,
      permissions,
      timestamp: Date.now(),
      nonce: this.generateSecureString(16),
    };

    const data = JSON.stringify(payload);
    const signature = this.generateWebhookSignature(data, this.configService.get<string>('JWT_SECRET') || 'default-secret');

    return Buffer.from(JSON.stringify({ payload, signature })).toString('base64');
  }

  /**
   * Verify API token
   */
  verifyApiToken(token: string): { merchantId: string; permissions: string[]; timestamp: number } | null {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      const signature = this.generateWebhookSignature(JSON.stringify(decoded.payload), this.configService.get<string>('JWT_SECRET') || 'default-secret');

      if (signature !== decoded.signature) {
        return null;
      }

      // Check if token is expired (24 hours)
      const tokenAge = Date.now() - decoded.payload.timestamp;
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return null;
      }

      return decoded.payload;
    } catch (error) {
      return null;
    }
  }
}
