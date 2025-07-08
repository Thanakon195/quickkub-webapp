import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { Transaction } from '../../src/transactions/entities/transaction.entity';

describe('ThaiPaymentController Webhook (e2e)', () => {
  let app: INestApplication;
  let transactionRepository: Repository<Transaction>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    transactionRepository = app.get(getRepositoryToken(Transaction));
  });

  afterAll(async () => {
    await app.close();
  });

  it('should process webhook successfully (valid signature)', async () => {
    // เตรียม transaction ตัวอย่าง
    const transaction = await transactionRepository.save({
      transactionId: 'TEST-TXN-001',
      amount: 1000,
      currency: 'THB',
      status: 'pending',
      type: 'payment',
    } as any);

    // Mock signature (ใน production ต้อง generate ตาม provider จริง)
    const signature = 'valid-mock-signature';

    const res = await request(app.getHttpServer())
      .post('/thai-payments/webhook/kbank')
      .set('x-webhook-signature', signature)
      .send({
        transactionId: transaction.transactionId,
        status: 'success',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.transactionId).toBe(transaction.transactionId);
    expect(res.body.status).toBe('completed');
  });

  it('should reject webhook with invalid signature', async () => {
    const res = await request(app.getHttpServer())
      .post('/thai-payments/webhook/kbank')
      .set('x-webhook-signature', 'invalid-signature')
      .send({
        transactionId: 'TEST-TXN-002',
        status: 'success',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Missing webhook signature|Invalid webhook signature/);
  });

  it('should handle duplicate webhook (idempotency)', async () => {
    // เตรียม transaction ตัวอย่าง
    const transaction = await transactionRepository.save({
      transactionId: 'TEST-TXN-003',
      amount: 500,
      currency: 'THB',
      status: 'pending',
      type: 'payment',
    } as any);

    // Mock signature
    const signature = 'valid-mock-signature';

    // ส่ง webhook ครั้งแรก
    await request(app.getHttpServer())
      .post('/thai-payments/webhook/kbank')
      .set('x-webhook-signature', signature)
      .send({
        transactionId: transaction.transactionId,
        status: 'success',
      });

    // ส่ง webhook ซ้ำ
    const res = await request(app.getHttpServer())
      .post('/thai-payments/webhook/kbank')
      .set('x-webhook-signature', signature)
      .send({
        transactionId: transaction.transactionId,
        status: 'success',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.transactionId).toBe(transaction.transactionId);
    expect(res.body.status).toBe('completed');
  });

  it('should return error for missing transactionId', async () => {
    const res = await request(app.getHttpServer())
      .post('/thai-payments/webhook/kbank')
      .set('x-webhook-signature', 'valid-mock-signature')
      .send({
        status: 'success',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/missing transactionId/);
  });
});
