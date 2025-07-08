import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========================================
    // 👥 USERS TABLE
    // ========================================
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
            length: '255',
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'suspended', 'pending'],
            default: "'pending'",
          },
          {
            name: 'email_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'phone_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'two_factor_enabled',
            type: 'boolean',
            default: false,
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // ========================================
    // 🏢 MERCHANTS TABLE
    // ========================================
    await queryRunner.createTable(
      new Table({
        name: 'merchants',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'business_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'business_type',
            type: 'enum',
            enum: ['individual', 'company', 'nonprofit'],
            default: "'individual'",
          },
          {
            name: 'tax_id',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'website',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'active', 'suspended', 'rejected'],
            default: "'pending'",
          },
          {
            name: 'verification_status',
            type: 'enum',
            enum: ['unverified', 'pending', 'verified', 'rejected'],
            default: "'unverified'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // ========================================
    // 💳 PAYMENTS TABLE
    // ========================================
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'merchant_id',
            type: 'uuid',
          },
          {
            name: 'customer_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
            default: "'pending'",
          },
          {
            name: 'payment_method',
            type: 'enum',
            enum: ['card', 'bank_transfer', 'digital_wallet', 'crypto'],
            default: "'card'",
          },
          {
            name: 'gateway_reference',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // ========================================
    // 💰 TRANSACTIONS TABLE
    // ========================================
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'payment_id',
            type: 'uuid',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['payment', 'refund', 'chargeback', 'settlement'],
            default: "'payment'",
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'fee_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'net_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
            default: "'pending'",
          },
          {
            name: 'gateway_response',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // ========================================
    // 🏦 WALLETS TABLE
    // ========================================
    await queryRunner.createTable(
      new Table({
        name: 'wallets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'merchant_id',
            type: 'uuid',
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
          },
          {
            name: 'balance',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'hold_balance',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'available_balance',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'suspended', 'closed'],
            default: "'active'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // ========================================
    // 📄 INVOICES TABLE
    // ========================================
    await queryRunner.createTable(
      new Table({
        name: 'invoices',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'merchant_id',
            type: 'uuid',
          },
          {
            name: 'invoice_number',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'customer_email',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
            default: "'draft'",
          },
          {
            name: 'due_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'paid_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // ========================================
    // 🔗 WEBHOOKS TABLE
    // ========================================
    await queryRunner.createTable(
      new Table({
        name: 'webhooks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'merchant_id',
            type: 'uuid',
          },
          {
            name: 'url',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'events',
            type: 'text[]',
          },
          {
            name: 'secret',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive'],
            default: "'active'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // ========================================
    // 💸 SETTLEMENTS TABLE
    // ========================================
    await queryRunner.createTable(
      new Table({
        name: 'settlements',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'merchant_id',
            type: 'uuid',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: "'pending'",
          },
          {
            name: 'settlement_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'bank_account_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'reference',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // ========================================
    // 🛡️ FRAUD RULES TABLE
    // ========================================
    await queryRunner.createTable(
      new Table({
        name: 'fraud_rules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'rule_type',
            type: 'enum',
            enum: ['amount_limit', 'frequency_limit', 'location_check', 'device_check'],
            default: "'amount_limit'",
          },
          {
            name: 'conditions',
            type: 'jsonb',
          },
          {
            name: 'action',
            type: 'enum',
            enum: ['block', 'flag', 'require_verification'],
            default: "'flag'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive'],
            default: "'active'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // ========================================
    // 📊 REPORTS TABLE
    // ========================================
    await queryRunner.createTable(
      new Table({
        name: 'reports',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'merchant_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['transaction', 'settlement', 'fraud', 'revenue'],
            default: "'transaction'",
          },
          {
            name: 'parameters',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: "'pending'",
          },
          {
            name: 'file_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // ========================================
    // 🔔 NOTIFICATIONS TABLE
    // ========================================
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'merchant_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['email', 'sms', 'push', 'webhook'],
            default: "'email'",
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'sent', 'delivered', 'failed'],
            default: "'pending'",
          },
          {
            name: 'sent_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // ========================================
    // 👨‍💼 ADMINS TABLE
    // ========================================
    await queryRunner.createTable(
      new Table({
        name: 'admins',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['super_admin', 'admin', 'support', 'analyst'],
            default: "'admin'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive'],
            default: "'active'",
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // ========================================
    // 📝 AUDIT LOGS TABLE
    // ========================================
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'admin_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'action',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'entity_type',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'entity_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'old_values',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'new_values',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // ========================================
    // 🔗 FOREIGN KEY CONSTRAINTS
    // ========================================

    // Merchants -> Users
    await queryRunner.createForeignKey(
      'merchants',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Payments -> Merchants
    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        columnNames: ['merchant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'merchants',
        onDelete: 'CASCADE',
      }),
    );

    // Transactions -> Payments
    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['payment_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'payments',
        onDelete: 'CASCADE',
      }),
    );

    // Wallets -> Merchants
    await queryRunner.createForeignKey(
      'wallets',
      new TableForeignKey({
        columnNames: ['merchant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'merchants',
        onDelete: 'CASCADE',
      }),
    );

    // Invoices -> Merchants
    await queryRunner.createForeignKey(
      'invoices',
      new TableForeignKey({
        columnNames: ['merchant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'merchants',
        onDelete: 'CASCADE',
      }),
    );

    // Webhooks -> Merchants
    await queryRunner.createForeignKey(
      'webhooks',
      new TableForeignKey({
        columnNames: ['merchant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'merchants',
        onDelete: 'CASCADE',
      }),
    );

    // Settlements -> Merchants
    await queryRunner.createForeignKey(
      'settlements',
      new TableForeignKey({
        columnNames: ['merchant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'merchants',
        onDelete: 'CASCADE',
      }),
    );

    // Reports -> Merchants
    await queryRunner.createForeignKey(
      'reports',
      new TableForeignKey({
        columnNames: ['merchant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'merchants',
        onDelete: 'CASCADE',
      }),
    );

    // Notifications -> Users
    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Notifications -> Merchants
    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        columnNames: ['merchant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'merchants',
        onDelete: 'CASCADE',
      }),
    );

    // Audit Logs -> Users
    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    // Audit Logs -> Admins
    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        columnNames: ['admin_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'admins',
        onDelete: 'SET NULL',
      }),
    );

    // ========================================
    // 📍 INDEXES
    // ========================================

    // Users indexes
    await queryRunner.createIndex('users', new TableIndex({ columnNames: ['email'] }));
    await queryRunner.createIndex('users', new TableIndex({ columnNames: ['status'] }));
    await queryRunner.createIndex('users', new TableIndex({ columnNames: ['created_at'] }));

    // Merchants indexes
    await queryRunner.createIndex('merchants', new TableIndex({ columnNames: ['user_id'] }));
    await queryRunner.createIndex('merchants', new TableIndex({ columnNames: ['status'] }));
    await queryRunner.createIndex('merchants', new TableIndex({ columnNames: ['verification_status'] }));

    // Payments indexes
    await queryRunner.createIndex('payments', new TableIndex({ columnNames: ['merchant_id'] }));
    await queryRunner.createIndex('payments', new TableIndex({ columnNames: ['status'] }));
    await queryRunner.createIndex('payments', new TableIndex({ columnNames: ['created_at'] }));
    await queryRunner.createIndex('payments', new TableIndex({ columnNames: ['gateway_reference'] }));

    // Transactions indexes
    await queryRunner.createIndex('transactions', new TableIndex({ columnNames: ['payment_id'] }));
    await queryRunner.createIndex('transactions', new TableIndex({ columnNames: ['type'] }));
    await queryRunner.createIndex('transactions', new TableIndex({ columnNames: ['status'] }));
    await queryRunner.createIndex('transactions', new TableIndex({ columnNames: ['created_at'] }));

    // Wallets indexes
    await queryRunner.createIndex('wallets', new TableIndex({ columnNames: ['merchant_id'] }));
    await queryRunner.createIndex('wallets', new TableIndex({ columnNames: ['currency'] }));

    // Invoices indexes
    await queryRunner.createIndex('invoices', new TableIndex({ columnNames: ['merchant_id'] }));
    await queryRunner.createIndex('invoices', new TableIndex({ columnNames: ['invoice_number'] }));
    await queryRunner.createIndex('invoices', new TableIndex({ columnNames: ['status'] }));
    await queryRunner.createIndex('invoices', new TableIndex({ columnNames: ['due_date'] }));

    // Webhooks indexes
    await queryRunner.createIndex('webhooks', new TableIndex({ columnNames: ['merchant_id'] }));
    await queryRunner.createIndex('webhooks', new TableIndex({ columnNames: ['status'] }));

    // Settlements indexes
    await queryRunner.createIndex('settlements', new TableIndex({ columnNames: ['merchant_id'] }));
    await queryRunner.createIndex('settlements', new TableIndex({ columnNames: ['status'] }));
    await queryRunner.createIndex('settlements', new TableIndex({ columnNames: ['settlement_date'] }));

    // Fraud Rules indexes
    await queryRunner.createIndex('fraud_rules', new TableIndex({ columnNames: ['status'] }));
    await queryRunner.createIndex('fraud_rules', new TableIndex({ columnNames: ['rule_type'] }));

    // Reports indexes
    await queryRunner.createIndex('reports', new TableIndex({ columnNames: ['merchant_id'] }));
    await queryRunner.createIndex('reports', new TableIndex({ columnNames: ['type'] }));
    await queryRunner.createIndex('reports', new TableIndex({ columnNames: ['status'] }));

    // Notifications indexes
    await queryRunner.createIndex('notifications', new TableIndex({ columnNames: ['user_id'] }));
    await queryRunner.createIndex('notifications', new TableIndex({ columnNames: ['merchant_id'] }));
    await queryRunner.createIndex('notifications', new TableIndex({ columnNames: ['type'] }));
    await queryRunner.createIndex('notifications', new TableIndex({ columnNames: ['status'] }));

    // Admins indexes
    await queryRunner.createIndex('admins', new TableIndex({ columnNames: ['email'] }));
    await queryRunner.createIndex('admins', new TableIndex({ columnNames: ['role'] }));
    await queryRunner.createIndex('admins', new TableIndex({ columnNames: ['status'] }));

    // Audit Logs indexes
    await queryRunner.createIndex('audit_logs', new TableIndex({ columnNames: ['user_id'] }));
    await queryRunner.createIndex('audit_logs', new TableIndex({ columnNames: ['admin_id'] }));
    await queryRunner.createIndex('audit_logs', new TableIndex({ columnNames: ['action'] }));
    await queryRunner.createIndex('audit_logs', new TableIndex({ columnNames: ['entity_type'] }));
    await queryRunner.createIndex('audit_logs', new TableIndex({ columnNames: ['created_at'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    const tables = [
      'audit_logs',
      'notifications',
      'reports',
      'fraud_rules',
      'settlements',
      'webhooks',
      'invoices',
      'wallets',
      'transactions',
      'payments',
      'merchants',
      'admins',
      'users',
    ];

    for (const table of tables) {
      const tableObj = await queryRunner.getTable(table);
      const foreignKeys = tableObj ? tableObj.foreignKeys : [];
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey(table, foreignKey);
      }
    }

    // Drop tables in reverse order
    for (const table of tables.reverse()) {
      await queryRunner.dropTable(table);
    }
  }
}
