import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddThaiPaymentMethodsAndOrders1700000000001 implements MigrationInterface {
  name = 'AddThaiPaymentMethodsAndOrders1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create thai_payment_methods table
    await queryRunner.query(`
      CREATE TYPE "public"."thai_payment_method_type_enum" AS ENUM(
        'promptpay', 'kbank', 'scb_easy', 'truemoney', 'gbprimepay', 'bbl', 'omise', '2c2p'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."thai_payment_method_status_enum" AS ENUM(
        'active', 'inactive', 'suspended', 'pending_approval'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "thai_payment_methods" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "merchantId" uuid NOT NULL,
        "type" "public"."thai_payment_method_type_enum" NOT NULL,
        "status" "public"."thai_payment_method_status_enum" NOT NULL DEFAULT 'pending_approval',
        "name" character varying(255) NOT NULL,
        "description" text,
        "config" jsonb,
        "limits" jsonb,
        "feePercentage" numeric(5,2) NOT NULL DEFAULT '0',
        "feeFixed" numeric(10,2) NOT NULL DEFAULT '0',
        "isEnabled" boolean NOT NULL DEFAULT true,
        "isDefault" boolean NOT NULL DEFAULT false,
        "priority" integer NOT NULL DEFAULT '0',
        "metadata" jsonb,
        "lastUsedAt" TIMESTAMP,
        "usageCount" integer NOT NULL DEFAULT '0',
        "totalVolume" numeric(15,2) NOT NULL DEFAULT '0',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_thai_payment_methods" PRIMARY KEY ("id")
      )
    `);

    // Create orders table
    await queryRunner.query(`
      CREATE TYPE "public"."order_status_enum" AS ENUM(
        'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'expired'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."order_type_enum" AS ENUM(
        'ecommerce', 'subscription', 'donation', 'service', 'digital'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "merchantId" uuid NOT NULL,
        "orderNumber" character varying(100) NOT NULL,
        "status" "public"."order_status_enum" NOT NULL DEFAULT 'pending',
        "type" "public"."order_type_enum" NOT NULL DEFAULT 'ecommerce',
        "subtotal" numeric(15,2) NOT NULL,
        "tax" numeric(15,2) NOT NULL DEFAULT '0',
        "shipping" numeric(15,2) NOT NULL DEFAULT '0',
        "discount" numeric(15,2) NOT NULL DEFAULT '0',
        "total" numeric(15,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'THB',
        "customerName" character varying(255) NOT NULL,
        "customerEmail" character varying(255) NOT NULL,
        "customerPhone" character varying(20),
        "customerId" character varying(255),
        "shippingAddress" jsonb,
        "billingAddress" jsonb,
        "items" jsonb NOT NULL,
        "paymentInfo" jsonb,
        "requiresTaxInvoice" boolean NOT NULL DEFAULT false,
        "taxId" character varying(50),
        "companyName" character varying(100),
        "thaiSpecific" jsonb,
        "metadata" jsonb,
        "confirmedAt" TIMESTAMP,
        "shippedAt" TIMESTAMP,
        "deliveredAt" TIMESTAMP,
        "cancelledAt" TIMESTAMP,
        "expiresAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_orders_orderNumber" UNIQUE ("orderNumber")
      )
    `);

    // Add indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_thai_payment_methods_merchant_type" ON "thai_payment_methods" ("merchantId", "type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_thai_payment_methods_type_status" ON "thai_payment_methods" ("type", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_merchant_orderNumber" ON "orders" ("merchantId", "orderNumber")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_status_createdAt" ON "orders" ("status", "createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_customer_email_merchant" ON "orders" ("customerEmail", "merchantId")
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "thai_payment_methods"
      ADD CONSTRAINT "FK_thai_payment_methods_merchant"
      FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD CONSTRAINT "FK_orders_merchant"
      FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Add columns to transactions table
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD COLUMN "thaiPaymentMethodId" uuid,
      ADD COLUMN "orderId" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_transactions_thai_payment_method"
      FOREIGN KEY ("thaiPaymentMethodId") REFERENCES "thai_payment_methods"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_transactions_order"
      FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Add indexes for transactions
    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_thai_payment_method" ON "transactions" ("thaiPaymentMethodId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_order" ON "transactions" ("orderId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_order"
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_thai_payment_method"
    `);

    await queryRunner.query(`
      ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_merchant"
    `);

    await queryRunner.query(`
      ALTER TABLE "thai_payment_methods" DROP CONSTRAINT "FK_thai_payment_methods_merchant"
    `);

    // Drop columns from transactions
    await queryRunner.query(`
      ALTER TABLE "transactions" DROP COLUMN "orderId"
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions" DROP COLUMN "thaiPaymentMethodId"
    `);

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX "IDX_transactions_order"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_transactions_thai_payment_method"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_orders_customer_email_merchant"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_orders_status_createdAt"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_orders_merchant_orderNumber"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_thai_payment_methods_type_status"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_thai_payment_methods_merchant_type"
    `);

    // Drop tables
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "thai_payment_methods"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."order_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."thai_payment_method_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."thai_payment_method_type_enum"`);
  }
}
