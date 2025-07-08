import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendVerificationEmail(user: any): Promise<void> {
    // Implementation for sending verification email
    console.log('Sending verification email to:', user.email);
  }

  async sendPasswordResetEmail(user: any): Promise<void> {
    // Implementation for sending password reset email
    console.log('Sending password reset email to:', user.email);
  }

  async sendEmail(options: { to: string; subject: string; template: string; context: any }): Promise<void> {
    // Implementation for sending generic email
    console.log('Sending email to:', options.to, 'Subject:', options.subject);
  }
}
