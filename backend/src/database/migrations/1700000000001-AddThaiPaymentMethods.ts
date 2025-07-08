import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddThaiPaymentMethods1700000000001 implements MigrationInterface {
  name = 'AddThaiPaymentMethods1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Thai Payment Methods table
    await queryRunner.query(`
      CREATE TYPE "public"."thai_payment_provider_enum" AS ENUM(
        'promptpay', 'kbank_api', 'scb_easy', 'bbl_api', 'truemoney',
        'gbprimepay', 'omise', '2c2p', 'line_pay', 'rabbit_line_pay'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."thai_payment_type_enum" AS ENUM(
        'qr_code', 'deep_link', 'api_call', 'redirect', 'webhook'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."thai_bank_code_enum" AS ENUM(
        '004', '014', '002', '025', '011', '022', '024', '023', '006', '021'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "thai_payment_methods" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "provider" "public"."thai_payment_provider_enum" NOT NULL,
        "type" "public"."thai_payment_type_enum" NOT NULL,
        "name" character varying NOT NULL,
        "displayName" character varying NOT NULL,
        "description" character varying,
        "config" jsonb NOT NULL,
        "metadata" jsonb,
        "isActive" boolean NOT NULL DEFAULT true,
        "isTestMode" boolean NOT NULL DEFAULT false,
        "testConfig" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_thai_payment_methods" PRIMARY KEY ("id")
      )
    `);

    // Create Orders table
    await queryRunner.query(`
      CREATE TYPE "public"."order_status_enum" AS ENUM(
        'pending', 'confirmed', 'processing', 'shipped', 'delivered',
        'cancelled', 'refunded', 'expired'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."order_type_enum" AS ENUM(
        'physical', 'digital', 'service', 'subscription'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "orderId" character varying NOT NULL,
        "status" "public"."order_status_enum" NOT NULL DEFAULT 'pending',
        "type" "public"."order_type_enum" NOT NULL DEFAULT 'physical',
        "subtotal" decimal(15,2) NOT NULL,
        "taxAmount" decimal(15,2) NOT NULL DEFAULT '0',
        "shippingAmount" decimal(15,2) NOT NULL DEFAULT '0',
        "discountAmount" decimal(15,2) NOT NULL DEFAULT '0',
        "totalAmount" decimal(15,2) NOT NULL,
        "vatAmount" decimal(15,2) NOT NULL DEFAULT '0',
        "withholdingTaxAmount" decimal(15,2) NOT NULL DEFAULT '0',
        "currency" character varying NOT NULL DEFAULT 'THB',
        "items" jsonb NOT NULL,
        "billingAddress" jsonb,
        "shippingAddress" jsonb,
        "metadata" jsonb,
        "notes" character varying,
        "expiresAt" TIMESTAMP,
        "confirmedAt" TIMESTAMP,
        "shippedAt" TIMESTAMP,
        "deliveredAt" TIMESTAMP,
        "cancelledAt" TIMESTAMP,
        "refundedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "customerId" uuid,
        "merchantId" uuid,
        CONSTRAINT "UQ_orders_orderId" UNIQUE ("orderId"),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD CONSTRAINT "FK_orders_customer"
      FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD CONSTRAINT "FK_orders_merchant"
      FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Add orderId column to transactions table
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD COLUMN "orderId" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_transactions_order"
      FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Insert default Thai payment methods
    await queryRunner.query(`
      INSERT INTO "thai_payment_methods" (
        "provider", "type", "name", "displayName", "description", "config", "metadata", "isActive"
      ) VALUES
      (
        'promptpay', 'qr_code', 'PromptPay', 'PromptPay QR', 'PromptPay QR Code payment',
        '{"qrCodeFormat": "EMV", "supportedBanks": ["004", "014", "002", "025", "011", "022", "024", "023", "006", "021"], "minAmount": 1, "maxAmount": 50000, "processingTime": 15, "feePercentage": 0.5, "fixedFee": 0}',
        '{"logo": "/images/promptpay-logo.png", "icon": "qr-code", "color": "#00A651", "isPopular": true, "isRecommended": true, "supportedCurrencies": ["THB"]}',
        true
      ),
      (
        'kbank_api', 'redirect', 'KBank', 'KBank Online Banking', 'KBank Online Banking payment',
        '{"endpoint": "https://online.kasikornbankgroup.com/api", "minAmount": 1, "maxAmount": 100000, "processingTime": 30, "feePercentage": 1.0, "fixedFee": 0}',
        '{"logo": "/images/kbank-logo.png", "icon": "bank", "color": "#1E3A8A", "isPopular": true, "supportedCurrencies": ["THB"]}',
        true
      ),
      (
        'scb_easy', 'deep_link', 'SCB Easy', 'SCB Easy App', 'SCB Easy App payment',
        '{"endpoint": "https://api.scbeasy.com", "minAmount": 1, "maxAmount": 100000, "processingTime": 30, "feePercentage": 1.0, "fixedFee": 0}',
        '{"logo": "/images/scb-logo.png", "icon": "mobile", "color": "#4F46E5", "isPopular": true, "supportedCurrencies": ["THB"]}',
        true
      ),
      (
        'truemoney', 'api_call', 'TrueMoney', 'TrueMoney Wallet', 'TrueMoney Wallet payment',
        '{"endpoint": "https://api.truemoney.com", "minAmount": 1, "maxAmount": 50000, "processingTime": 30, "feePercentage": 1.5, "fixedFee": 0}',
        '{"logo": "/images/truemoney-logo.png", "icon": "wallet", "color": "#DC2626", "isPopular": true, "supportedCurrencies": ["THB"]}',
        true
      ),
      (
        'gbprimepay', 'redirect', 'GBPrimePay', 'GBPrimePay', 'GBPrimePay payment gateway',
        '{"endpoint": "https://api.gbprimepay.com", "minAmount": 1, "maxAmount": 100000, "processingTime": 30, "feePercentage": 1.0, "fixedFee": 0}',
        '{"logo": "/images/gbprimepay-logo.png", "icon": "credit-card", "color": "#059669", "supportedCurrencies": ["THB"]}',
        true
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_thai_payment_methods_provider" ON "thai_payment_methods" ("provider")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_thai_payment_methods_active" ON "thai_payment_methods" ("isActive")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_orderId" ON "orders" ("orderId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_status" ON "orders" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_customer" ON "orders" ("customerId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_merchant" ON "orders" ("merchantId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_order" ON "transactions" ("orderId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_transactions_order"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_merchant"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_customer"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_status"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_orderId"`);
    await queryRunner.query(`DROP INDEX "IDX_thai_payment_methods_active"`);
    await queryRunner.query(`DROP INDEX "IDX_thai_payment_methods_provider"`);

    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_order"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_merchant"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_customer"`);

    // Drop columns
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "orderId"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "thai_payment_methods"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."order_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."thai_bank_code_enum"`);
    await queryRunner.query(`DROP TYPE "public"."thai_payment_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."thai_payment_provider_enum"`);
  }
}
