# Contributing to QuickKub Payment Gateway

ขอบคุณที่สนใจในการพัฒนา QuickKub Payment Gateway! เอกสารนี้จะช่วยให้คุณเริ่มต้นการมีส่วนร่วมในโปรเจกต์

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)
- [Documentation](#documentation)

## Code of Conduct

โปรเจกต์นี้มี Code of Conduct ที่เราคาดหวังให้ผู้มีส่วนร่วมทุกคนปฏิบัติตาม

### Our Standards

- ใช้ภาษาที่เป็นมิตรและให้กำลังใจ
- ให้ความเคารพต่อความคิดเห็นที่แตกต่าง
- ยอมรับการวิจารณ์ที่สร้างสรรค์อย่างสุภาพ
- มุ่งเน้นที่สิ่งที่สำคัญที่สุดสำหรับชุมชน
- แสดงความเห็นอกเห็นใจต่อสมาชิกชุมชนคนอื่น

### Unacceptable Behavior

- การใช้ภาษาหรือภาพที่ไม่เหมาะสม
- การกลั่นแกล้ง การดูหมิ่น/ดูถูก การแสดงความคิดเห็นที่ไม่เหมาะสม
- การรบกวนส่วนตัวหรือทางการเมือง
- การละเมิดความเป็นส่วนตัวของผู้อื่น

## Getting Started

### Prerequisites

- Node.js 18+ (LTS version recommended)
- npm 9+ หรือ yarn 1.22+
- Docker 20.10+
- Docker Compose 2.0+
- Git 2.30+

### Fork and Clone

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/quickkub-payment-gateway.git
   cd quickkub-payment-gateway
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/original-org/quickkub-payment-gateway.git
   ```

## Development Setup

### 1. Install Dependencies

```bash
# Install all dependencies
npm run install

# Or install individually
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
cd ../landing && npm install
```

### 2. Environment Configuration

```bash
# Copy environment files
cp env.example .env.development

# Edit environment variables
nano .env.development
```

### 3. Start Development Environment

```bash
# Start all services
npm run dev

# Or start specific service
npm run dev:backend
npm run dev:frontend
npm run dev:admin
```

### 4. Database Setup

```bash
# Run migrations
npm run migrate

# Seed initial data
npm run migrate:seed
```

## Coding Standards

### TypeScript

- ใช้ strict mode
- ไม่ใช้ `any` type
- ใช้ interface แทน type เมื่อเป็นไปได้
- ใช้ enum สำหรับค่าคงที่
- ใช้ generic types เมื่อเหมาะสม

```typescript
// Good
interface Payment {
  id: number
  amount: number
  currency: string
  status: PaymentStatus
}

enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// Bad
const payment: any = {
  id: 1,
  amount: 1000,
}
```

### JavaScript/React

- ใช้ functional components
- ใช้ hooks แทน class components
- ใช้ destructuring
- ใช้ arrow functions
- ใช้ template literals

```javascript
// Good
const PaymentList = ({ payments, onPaymentClick }) => {
  const [loading, setLoading] = useState(false)

  const handleClick = useCallback(
    (payment) => {
      onPaymentClick(payment)
    },
    [onPaymentClick]
  )

  return (
    <div className="payment-list">
      {payments.map((payment) => (
        <PaymentItem key={payment.id} payment={payment} onClick={handleClick} />
      ))}
    </div>
  )
}

// Bad
class PaymentList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
    }
  }
}
```

### NestJS

- ใช้ decorators อย่างเหมาะสม
- ใช้ dependency injection
- ใช้ guards และ interceptors
- ใช้ DTOs สำหรับ validation
- ใช้ proper error handling

```typescript
// Good
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      return await this.paymentsService.create(createPaymentDto)
    } catch (error) {
      throw new PaymentCreationException(error.message)
    }
  }
}
```

### CSS/Styling

- ใช้ TailwindCSS
- ใช้ CSS modules หรือ styled-components
- ใช้ consistent naming conventions
- ใช้ responsive design
- ใช้ accessibility best practices

```css
/* Good */
.payment-card {
  @apply bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow;
}

.payment-amount {
  @apply text-2xl font-bold text-green-600;
}

/* Bad */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
}
```

## Testing

### Unit Tests

- เขียน test สำหรับทุก function และ component
- ใช้ descriptive test names
- ใช้ proper test structure (Arrange, Act, Assert)
- ใช้ mocking เมื่อเหมาะสม

```typescript
// Good
describe('PaymentsService', () => {
  describe('create', () => {
    it('should create a payment with valid data', async () => {
      // Arrange
      const createPaymentDto = {
        amount: 1000,
        currency: 'THB',
        description: 'Test payment',
      }
      const expectedPayment = { id: 1, ...createPaymentDto }

      // Act
      const result = await paymentsService.create(createPaymentDto)

      // Assert
      expect(result).toEqual(expectedPayment)
    })

    it('should throw error for invalid amount', async () => {
      // Arrange
      const createPaymentDto = {
        amount: -100,
        currency: 'THB',
      }

      // Act & Assert
      await expect(paymentsService.create(createPaymentDto)).rejects.toThrow(
        'Amount must be positive'
      )
    })
  })
})
```

### Integration Tests

- เขียน test สำหรับ API endpoints
- test database interactions
- test external service integrations
- ใช้ test database

```typescript
// Good
describe('Payments API (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/payments (POST)', () => {
    return request(app.getHttpServer())
      .post('/payments')
      .send({
        amount: 1000,
        currency: 'THB',
        description: 'Test payment',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id')
        expect(res.body.amount).toBe(1000)
      })
  })
})
```

### Performance Tests

- เขียน load tests สำหรับ critical paths
- test response times
- test concurrent users
- ใช้ k6 หรือ Artillery

```javascript
// k6 performance test
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
}

export default function () {
  const response = http.get('http://localhost:3002/health')
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  })
  sleep(1)
}
```

## Pull Request Process

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- เขียน code ตาม coding standards
- เขียน tests สำหรับ new features
- อัปเดต documentation เมื่อจำเป็น
- ใช้ conventional commits

```bash
# Conventional commits
git commit -m "feat: add new payment method"
git commit -m "fix: resolve authentication issue"
git commit -m "docs: update API documentation"
git commit -m "test: add unit tests for payment service"
```

### 3. Run Tests

```bash
# Run all tests
npm run test

# Run specific tests
npm run test:unit
npm run test:integration
npm run test:performance
```

### 4. Code Quality Checks

```bash
# Run linting
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### 5. Create Pull Request

1. Push your branch:

   ```bash
   git push origin feature/your-feature-name
   ```

2. Create PR on GitHub:
   - ใช้ descriptive title
   - เขียน detailed description
   - ระบุ type ของ change (bug fix, feature, etc.)
   - ระบุ breaking changes (ถ้ามี)
   - ระบุ testing steps

### 6. PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Performance tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Bug Reports

### Bug Report Template

```markdown
## Bug Description

Clear and concise description of the bug

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior

What you expected to happen

## Actual Behavior

What actually happened

## Environment

- OS: [e.g. Ubuntu 20.04]
- Node.js: [e.g. 18.17.0]
- Docker: [e.g. 20.10.21]
- Browser: [e.g. Chrome 115]

## Additional Context

Screenshots, logs, etc.
```

## Feature Requests

### Feature Request Template

```markdown
## Feature Description

Clear and concise description of the feature

## Problem Statement

What problem does this feature solve?

## Proposed Solution

How should this feature work?

## Alternatives Considered

Other solutions you've considered

## Additional Context

Screenshots, mockups, etc.
```

## Documentation

### Writing Documentation

- เขียน clear และ concise
- ใช้ examples
- อัปเดตเมื่อ code เปลี่ยน
- ใช้ proper formatting
- ใช้ screenshots เมื่อเหมาะสม

### Documentation Structure

```
docs/
├── README.md              # Project overview
├── API.md                 # API documentation
├── DEPLOYMENT.md          # Deployment guide
├── DEVELOPMENT.md         # Development guide
├── TROUBLESHOOTING.md     # Troubleshooting guide
├── CONTRIBUTING.md        # This file
└── examples/              # Code examples
    ├── backend/
    ├── frontend/
    └── admin/
```

## Getting Help

### Before Asking

1. Check existing documentation
2. Search existing issues
3. Check troubleshooting guide
4. Try to reproduce the issue

### Asking for Help

- ใช้ clear และ descriptive language
- ระบุ environment details
- ระบุ steps to reproduce
- ระบุ expected vs actual behavior
- ระบุ error messages และ logs

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **Discord**: For general discussion
- **Email**: For security issues
- **Stack Overflow**: For programming questions

## Recognition

### Contributors

ผู้มีส่วนร่วมจะได้รับการระบุใน:

- README.md contributors section
- GitHub contributors page
- Release notes

### Types of Contributions

- Code contributions
- Documentation improvements
- Bug reports
- Feature requests
- Testing
- Code review
- Community support

## License

By contributing to QuickKub Payment Gateway, you agree that your contributions will be licensed under the same license as the project.

## Questions?

หากมีคำถามเกี่ยวกับการมีส่วนร่วม กรุณาติดต่อ:

- Email: contributors@quickkub.com
- Discord: https://discord.gg/quickkub
- GitHub Issues: https://github.com/your-org/quickkub-payment-gateway/issues

ขอบคุณสำหรับการมีส่วนร่วมในการพัฒนา QuickKub Payment Gateway! 🚀
