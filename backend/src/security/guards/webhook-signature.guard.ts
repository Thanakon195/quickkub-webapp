import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Request } from 'express';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const signature = request.headers['x-webhook-signature'] as string;
    const timestamp = request.headers['x-webhook-timestamp'] as string;
    const body = request.body;

    if (!signature || !timestamp) {
      throw new UnauthorizedException('Missing webhook signature or timestamp');
    }

    // Verify timestamp (prevent replay attacks)
    const now = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp);
    const timeDiff = Math.abs(now - requestTime);

    if (timeDiff > 300) { // 5 minutes tolerance
      throw new UnauthorizedException('Webhook timestamp is too old');
    }

    // Verify signature
    const expectedSignature = this.generateSignature(body, timestamp);

    if (!crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }

  private generateSignature(payload: any, timestamp: string): string {
    const secret = this.configService.get<string>('WEBHOOK_SECRET');
    if (!secret) {
      throw new Error('WEBHOOK_SECRET is not set');
    }
    const data = JSON.stringify(payload) + timestamp;
    return crypto
      .createHmac('sha256', secret)
      .update(data, 'utf8')
      .digest('hex');
  }
}
