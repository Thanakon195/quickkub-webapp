# QuickKub Payment Gateway Development Guide

## Overview

คู่มือการพัฒนา QuickKub Payment Gateway สำหรับนักพัฒนา

## Prerequisites

### Required Software

- **Node.js**: 18+ (LTS version recommended)
- **npm**: 9+ หรือ **yarn**: 1.22+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 2.30+
- **PostgreSQL**: 14+ (optional, can use Docker)
- **Redis**: 7+ (optional, can use Docker)

### IDE Setup

**Recommended IDEs:**

- **VS Code** with extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - Docker
  - GitLens
  - REST Client

**Alternative IDEs:**

- **WebStorm** / **IntelliJ IDEA**
- **Sublime Text**
- **Vim** / **Neovim**

## Project Structure

```
quickkub-payment-gateway/
├── backend/                 # NestJS Backend API
│   ├── src/
│   │   ├── auth/           # Authentication & Authorization
│   │   ├── users/          # User Management
│   │   ├── merchants/      # Merchant Management
│   │   ├── payments/       # Payment Processing
│   │   ├── transactions/   # Transaction Management
│   │   ├── wallets/        # Wallet System
│   │   ├── invoices/       # Invoice Management
│   │   ├── webhooks/       # Webhook System
│   │   ├── settlements/    # Settlement Management
│   │   ├── fraud/          # Fraud Detection
│   │   ├── reports/        # Reporting System
│   │   ├── notifications/  # Notification System
│   │   ├── admin/          # Admin Operations
│   │   ├── config/         # Configuration
│   │   ├── database/       # Database migrations & seeds
│   │   └── common/         # Shared utilities
│   ├── test/               # Tests
│   └── Dockerfile          # Docker configuration
├── frontend/               # Next.js Frontend
│   ├── app/               # App Router (Next.js 13+)
│   ├── components/        # React Components
│   ├── lib/               # Utilities
│   ├── hooks/             # Custom Hooks
│   ├── types/             # TypeScript types
│   └── public/            # Static assets
├── admin/                 # React Admin Panel
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Shared components
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utilities
│   └── public/            # Static assets
├── landing/               # Landing Page
├── devops/                # DevOps configuration
│   ├── docker-compose.yml
│   ├── nginx/
│   └── postgres/
├── scripts/               # Utility scripts
├── docs/                  # Documentation
└── tests/                 # Integration tests
```

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/your-org/quickkub-payment-gateway.git
cd quickkub-payment-gateway
```

### 2. Environment Setup

```bash
# Copy environment files
cp env.example .env.development

# Edit development environment
nano .env.development
```

### 3. Start Development Environment

```bash
# Start all services
./scripts/dev.sh all

# Or start specific service
./scripts/dev.sh backend
./scripts/dev.sh frontend
./scripts/dev.sh admin
```

### 4. Database Setup

```bash
# Run migrations
./scripts/migrate.sh run

# Seed initial data
./scripts/migrate.sh seed
```

## Development Workflow

### 1. Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# ...

# Commit changes
git add .
git commit -m "feat: add new payment method"

# Push to remote
git push origin feature/your-feature-name

# Create pull request
```

### 2. Code Standards

**TypeScript Configuration:**

- Strict mode enabled
- No implicit any
- Strict null checks
- No unused variables

**ESLint Rules:**

- Airbnb style guide
- TypeScript specific rules
- Import/export rules
- React hooks rules

**Prettier Configuration:**

- Single quotes
- Trailing commas
- 2 spaces indentation
- 80 characters line length

### 3. Testing

```bash
# Run all tests
./scripts/test.sh all

# Run specific service tests
./scripts/test.sh backend unit
./scripts/test.sh frontend unit
./scripts/test.sh admin unit

# Run integration tests
./scripts/test.sh integration

# Run performance tests
./scripts/test.sh performance
```

### 4. Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Build check
npm run build
```

## Backend Development

### 1. Module Structure

```typescript
// Example: payments module
payments/
├── entities/
│   └── payment.entity.ts
├── dto/
│   ├── create-payment.dto.ts
│   └── update-payment.dto.ts
├── payments.controller.ts
├── payments.service.ts
├── payments.module.ts
└── payments.service.spec.ts
```

### 2. Creating New Module

```bash
# Generate module
nest generate module payments

# Generate controller
nest generate controller payments

# Generate service
nest generate service payments

# Generate entity
nest generate class payments/entities/payment.entity
```

### 3. Entity Example

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number

  @Column()
  currency: string

  @Column()
  status: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
```

### 4. Service Example

```typescript
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Payment } from './entities/payment.entity'
import { CreatePaymentDto } from './dto/create-payment.dto'

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create(createPaymentDto)
    return await this.paymentRepository.save(payment)
  }

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.find()
  }

  async findOne(id: number): Promise<Payment> {
    return await this.paymentRepository.findOne({ where: { id } })
  }
}
```

### 5. Controller Example

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { PaymentsService } from './payments.service'
import { CreatePaymentDto } from './dto/create-payment.dto'

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  findAll() {
    return this.paymentsService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by id' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id)
  }
}
```

## Frontend Development

### 1. Component Structure

```typescript
// Example: PaymentForm component
components/
├── ui/                    # Base UI components
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
├── forms/                 # Form components
│   └── PaymentForm.tsx
├── layout/                # Layout components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Footer.tsx
└── features/              # Feature-specific components
    ├── payments/
    └── merchants/
```

### 2. Page Structure

```typescript
// Example: payments page
app/
├── payments/
│   ├── page.tsx          # Main page component
│   ├── loading.tsx       # Loading component
│   ├── error.tsx         # Error component
│   └── components/       # Page-specific components
│       ├── PaymentList.tsx
│       └── PaymentFilters.tsx
```

### 3. API Integration

```typescript
// lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

### 4. Custom Hooks

```typescript
// hooks/usePayments.ts
import { useState, useEffect } from 'react'
import api from '@/lib/api'

export function usePayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/payments')
      setPayments(response.data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return { payments, loading, error, refetch: fetchPayments }
}
```

## Admin Panel Development

### 1. Component Structure

```typescript
// Example: Admin component structure
src/
├── components/
│   ├── common/            # Shared components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Loading.tsx
│   ├── forms/             # Form components
│   │   ├── MerchantForm.tsx
│   │   └── PaymentForm.tsx
│   └── tables/            # Table components
│       ├── DataTable.tsx
│       └── Pagination.tsx
├── pages/                 # Page components
│   ├── Dashboard.tsx
│   ├── MerchantManagement.tsx
│   └── TransactionMonitoring.tsx
└── hooks/                 # Custom hooks
    ├── useApi.ts
    └── useAuth.ts
```

### 2. Routing

```typescript
// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MerchantManagement from './pages/MerchantManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/merchants" element={<MerchantManagement />} />
      </Routes>
    </Router>
  );
}
```

## Database Development

### 1. Creating Migrations

```bash
# Generate migration
npm run migration:generate -- src/database/migrations/CreatePaymentsTable

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### 2. Migration Example

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreatePaymentsTable1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
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
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payments')
  }
}
```

### 3. Seeding Data

```typescript
// database/seeds/payment.seed.ts
import { DataSource } from 'typeorm'
import { Payment } from '../../payments/entities/payment.entity'

export class PaymentSeed {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const paymentRepository = this.dataSource.getRepository(Payment)

    const payments = [
      {
        amount: 1000,
        currency: 'THB',
        status: 'completed',
      },
      {
        amount: 2000,
        currency: 'THB',
        status: 'pending',
      },
    ]

    for (const paymentData of payments) {
      const payment = paymentRepository.create(paymentData)
      await paymentRepository.save(payment)
    }
  }
}
```

## Testing

### 1. Unit Tests

```typescript
// payments.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { PaymentsService } from './payments.service'
import { Payment } from './entities/payment.entity'

describe('PaymentsService', () => {
  let service: PaymentsService
  let mockRepository: any

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<PaymentsService>(PaymentsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a payment', async () => {
      const createPaymentDto = { amount: 1000, currency: 'THB' }
      const expectedPayment = { id: 1, ...createPaymentDto }

      mockRepository.create.mockReturnValue(expectedPayment)
      mockRepository.save.mockResolvedValue(expectedPayment)

      const result = await service.create(createPaymentDto)

      expect(result).toEqual(expectedPayment)
      expect(mockRepository.create).toHaveBeenCalledWith(createPaymentDto)
      expect(mockRepository.save).toHaveBeenCalledWith(expectedPayment)
    })
  })
})
```

### 2. Integration Tests

```typescript
// payments.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'

describe('Payments (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/payments (GET)', () => {
    return request(app.getHttpServer()).get('/payments').expect(200)
  })

  it('/payments (POST)', () => {
    return request(app.getHttpServer())
      .post('/payments')
      .send({ amount: 1000, currency: 'THB' })
      .expect(201)
  })
})
```

## Debugging

### 1. Backend Debugging

```bash
# Start with debug mode
npm run start:debug

# Use VS Code debugger
# Add to .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug NestJS",
  "program": "${workspaceFolder}/backend/src/main.ts",
  "runtimeArgs": ["-r", "ts-node/register"],
  "env": {
    "NODE_ENV": "development"
  }
}
```

### 2. Frontend Debugging

```bash
# Start with debug mode
npm run dev

# Use browser dev tools
# Add React Developer Tools extension
```

### 3. Database Debugging

```bash
# Connect to database
docker-compose exec postgres psql -U quickkub_user -d quickkub_db

# Enable query logging
SET log_statement = 'all';
```

## Performance Optimization

### 1. Backend Optimization

```typescript
// Use caching
@UseInterceptors(CacheInterceptor)
@CacheKey('payments')
@CacheTTL(300)
async findAll(): Promise<Payment[]> {
  return await this.paymentRepository.find();
}

// Use pagination
async findAll(page: number = 1, limit: number = 10): Promise<Payment[]> {
  return await this.paymentRepository.find({
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

### 2. Frontend Optimization

```typescript
// Use React.memo for expensive components
const PaymentList = React.memo(({ payments }) => {
  return (
    <div>
      {payments.map(payment => (
        <PaymentItem key={payment.id} payment={payment} />
      ))}
    </div>
  );
});

// Use useMemo for expensive calculations
const totalAmount = useMemo(() => {
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
}, [payments]);
```

## Deployment

### 1. Local Testing

```bash
# Build and test locally
./scripts/deploy.sh local

# Run integration tests
./scripts/test.sh integration
```

### 2. Staging Deployment

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Run smoke tests
./scripts/test.sh smoke
```

### 3. Production Deployment

```bash
# Deploy to production
./scripts/deploy.sh production

# Monitor deployment
./scripts/monitor.sh all
```

## Best Practices

### 1. Code Organization

- Keep modules small and focused
- Use consistent naming conventions
- Separate concerns (business logic, data access, presentation)
- Use dependency injection
- Follow SOLID principles

### 2. Error Handling

```typescript
// Use custom exceptions
export class PaymentNotFoundException extends NotFoundException {
  constructor(paymentId: number) {
    super(`Payment with ID ${paymentId} not found`)
  }
}

// Use global exception filter
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Handle exceptions
  }
}
```

### 3. Security

- Validate all inputs
- Use parameterized queries
- Implement rate limiting
- Use HTTPS in production
- Sanitize user inputs
- Implement proper authentication

### 4. Documentation

- Write clear commit messages
- Document complex business logic
- Keep README updated
- Use JSDoc for functions
- Document API endpoints

## Resources

- **NestJS Documentation**: https://docs.nestjs.com
- **Next.js Documentation**: https://nextjs.org/docs
- **React Documentation**: https://react.dev
- **TypeScript Documentation**: https://www.typescriptlang.org/docs
- **TypeORM Documentation**: https://typeorm.io
- **Docker Documentation**: https://docs.docker.com
