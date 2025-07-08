import { Body, Controller, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('email')
  sendEmail(@Body() emailData: { to: string; subject: string; content: string }) {
    return this.notificationsService.sendEmail(
      emailData.to,
      emailData.subject,
      emailData.content,
    );
  }

  @Post('sms')
  sendSMS(@Body() smsData: { to: string; message: string }) {
    return this.notificationsService.sendSMS(smsData.to, smsData.message);
  }

  @Post('push')
  sendPushNotification(
    @Body() pushData: { userId: string; title: string; body: string },
  ) {
    return this.notificationsService.sendPushNotification(
      pushData.userId,
      pushData.title,
      pushData.body,
    );
  }

  @Post('webhook')
  sendWebhookNotification(
    @Body() webhookData: { url: string; payload: any },
  ) {
    return this.notificationsService.sendWebhookNotification(
      webhookData.url,
      webhookData.payload,
    );
  }

  @Post('transaction')
  sendTransactionNotification(
    @Body() transactionData: { transactionId: string; status: string },
  ) {
    return this.notificationsService.sendTransactionNotification(
      transactionData.transactionId,
      transactionData.status,
    );
  }
}
