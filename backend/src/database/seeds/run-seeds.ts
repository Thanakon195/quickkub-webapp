import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { seedThaiPaymentMethods } from './thai-payment-methods.seed';

async function runSeeds() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const dataSource = app.get(DataSource);

  console.log('🌱 Starting database seeding...');

  try {
    // Import and run seeders here
    // await app.get(MerchantSeeder).run();
    // await app.get(AdminSeeder).run();
    // await app.get(PaymentProviderSeeder).run();

    // Seed Thai Payment Methods
    console.log('🌱 Seeding Thai Payment Methods...');
    await seedThaiPaymentMethods(dataSource);

    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runSeeds();
