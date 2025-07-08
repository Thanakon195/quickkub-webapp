import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { Request } from 'express';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provider = request.params.provider;
    const signature = this.extractSignature(request);
    const payload = this.extractPayload(request);

    if (!signature) {
      throw new BadRequestException('Missing webhook signature');
    }

    if (!this.verifySignature(provider, payload, signature)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }

  private extractSignature(request: Request): string | null {
    // Try to get signature from different sources
    const signature =
      request.headers['x-webhook-signature'] ||
      request.headers['x-signature'] ||
      request.headers['signature'] ||
      request.query.signature ||
      (request.body && request.body.signature);

    return Array.isArray(signature) ? signature[0] : signature;
  }

  private extractPayload(request: Request): string {
    // For GET requests, use query string
    if (request.method === 'GET') {
      return JSON.stringify(request.query);
    }

    // For POST requests, use body
    return JSON.stringify(request.body);
  }

  private verifySignature(provider: string, payload: string, signature: string): boolean {
    const secret = this.getWebhookSecret(provider);
    if (!secret) {
      // In development, allow without verification
      return process.env.NODE_ENV === 'development';
    }

    const expectedSignature = this.generateSignature(payload, secret, provider);
    return this.compareSignatures(signature, expectedSignature);
  }

  private getWebhookSecret(provider: string): string | null {
    const secrets: Record<string, string | undefined> = {
      kbank: process.env.KBANK_WEBHOOK_SECRET,
      scb: process.env.SCB_WEBHOOK_SECRET,
      truemoney: process.env.TRUEMONEY_WEBHOOK_SECRET,
      gbprimepay: process.env.GBPRIMEPAY_WEBHOOK_SECRET,
      omise: process.env.OMISE_WEBHOOK_SECRET,
      '2c2p': process.env.C2C2P_WEBHOOK_SECRET,
    };

    return secrets[provider.toLowerCase()] || null;
  }

  private generateSignature(payload: string, secret: string, provider: string): string {
    switch (provider.toLowerCase()) {
      case 'kbank':
        return this.generateKBankSignature(payload, secret);
      case 'scb':
        return this.generateSCBSignature(payload, secret);
      case 'truemoney':
        return this.generateTrueMoneySignature(payload, secret);
      case 'gbprimepay':
        return this.generateGBPrimePaySignature(payload, secret);
      case 'omise':
        return this.generateOmiseSignature(payload, secret);
      case '2c2p':
        return this.generateC2C2PSignature(payload, secret);
      default:
        return this.generateDefaultSignature(payload, secret);
    }
  }

  private generateKBankSignature(payload: string, secret: string): string {
    return createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  private generateSCBSignature(payload: string, secret: string): string {
    return createHmac('sha512', secret)
      .update(payload)
      .digest('hex');
  }

  private generateTrueMoneySignature(payload: string, secret: string): string {
    return createHmac('sha256', secret)
      .update(payload)
      .digest('base64');
  }

  private generateGBPrimePaySignature(payload: string, secret: string): string {
    return createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  private generateOmiseSignature(payload: string, secret: string): string {
    return createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  private generateC2C2PSignature(payload: string, secret: string): string {
    return createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  private generateDefaultSignature(payload: string, secret: string): string {
    return createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  private compareSignatures(received: string, expected: string): boolean {
    // Use constant-time comparison to prevent timing attacks
    if (received.length !== expected.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < received.length; i++) {
      result |= received.charCodeAt(i) ^ expected.charCodeAt(i);
    }

    return result === 0;
  }
}
