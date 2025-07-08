import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:3000').split(','),
    credentials: configService.get('CORS_CREDENTIALS', true),
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  if (configService.get('ENABLE_SWAGGER', true)) {
    const config = new DocumentBuilder()
      .setTitle('QuickKub Payment Gateway API')
      .setDescription('Enterprise-grade payment gateway system for multi-tenant SaaS')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('merchants', 'Merchant management')
      .addTag('payments', 'Payment processing')
      .addTag('transactions', 'Transaction management')
      .addTag('wallets', 'Wallet management')
      .addTag('invoices', 'Invoice management')
      .addTag('webhooks', 'Webhook handling')
      .addTag('settlements', 'Settlement management')
      .addTag('fraud', 'Fraud detection')
      .addTag('reports', 'Reporting')
      .addTag('notifications', 'Notifications')
      .addTag('admin', 'Admin operations')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = configService.get('BACKEND_PORT', 3002);
  await app.listen(port);

  console.log(`🚀 QuickKub Backend is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/docs`);
  console.log(`🏥 Health Check: http://localhost:${port}/health`);
}

bootstrap();
