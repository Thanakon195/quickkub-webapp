#!/bin/bash

# QuickKub Payment Gateway - Test Setup Script
# Usage: ./scripts/test-setup.sh [type]

set -e

TEST_TYPE=${1:-all}

echo "🧪 Setting up QuickKub Payment Gateway test environment..."

# Function to setup backend tests
setup_backend_tests() {
    echo "🔧 Setting up backend tests..."
    cd backend

    # Install test dependencies
    npm install --save-dev @nestjs/testing @nestjs/supertest jest supertest

    # Create test database
    echo "📊 Creating test database..."
    docker-compose -f ../devops/docker-compose.test.yml up -d postgres-test redis-test

    # Wait for database to be ready
    echo "⏳ Waiting for test database..."
    sleep 10

    # Run migrations
    echo "🔄 Running test migrations..."
    npm run migration:run

    # Seed test data
    echo "🌱 Seeding test data..."
    npm run seed:test

    echo "✅ Backend test setup completed"
}

# Function to setup frontend tests
setup_frontend_tests() {
    echo "🔧 Setting up frontend tests..."
    cd frontend

    # Install test dependencies
    npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom

    # Create test configuration
    echo "📝 Creating test configuration..."
    cat > jest.config.js << EOF
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
EOF

    # Create jest setup file
    cat > jest.setup.js << EOF
import '@testing-library/jest-dom';
EOF

    echo "✅ Frontend test setup completed"
}

# Function to setup E2E tests
setup_e2e_tests() {
    echo "🔧 Setting up E2E tests..."

    # Install Playwright
    npm install --save-dev @playwright/test

    # Initialize Playwright
    npx playwright install

    # Create Playwright config
    cat > playwright.config.ts << EOF
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
EOF

    echo "✅ E2E test setup completed"
}

# Function to setup performance tests
setup_performance_tests() {
    echo "🔧 Setting up performance tests..."

    # Install k6
    npm install --save-dev k6

    # Create k6 test directory
    mkdir -p tests/performance

    # Create sample load test
    cat > tests/performance/load-test.js << EOF
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3002';

export default function () {
  // Health check
  const healthResponse = http.get(\`\${BASE_URL}/health\`);
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
  });

  // Payment creation
  const paymentData = {
    amount: 1000,
    currency: 'THB',
    paymentMethod: 'promptpay',
    merchantId: 'test-merchant',
    customerId: 'test-customer',
    description: 'Load test payment',
  };

  const paymentResponse = http.post(\`\${BASE_URL}/api/v1/payments\`, JSON.stringify(paymentData), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(paymentResponse, {
    'payment creation status is 201': (r) => r.status === 201,
    'payment creation time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
EOF

    echo "✅ Performance test setup completed"
}

# Function to setup security tests
setup_security_tests() {
    echo "🔧 Setting up security tests..."

    # Install OWASP ZAP
    npm install --save-dev @zaproxy/zap-api

    # Create security test directory
    mkdir -p tests/security

    # Create security test script
    cat > tests/security/security-scan.js << EOF
const { ZapClient } = require('@zaproxy/zap-api');

const zap = new ZapClient({
  apiKey: process.env.ZAP_API_KEY || 'your-api-key',
  proxy: 'http://localhost:8080',
});

async function runSecurityScan() {
  try {
    console.log('🔍 Starting security scan...');

    // Start ZAP
    await zap.core.newSession('QuickKub Security Scan', true);

    // Spider scan
    console.log('🕷️ Running spider scan...');
    await zap.spider.scan('http://localhost:3000', 10, 5, '', '', '');

    // Active scan
    console.log('🎯 Running active scan...');
    await zap.ascan.scan('http://localhost:3000', 1, 2, 'Default Policy', '', '');

    // Generate report
    console.log('📊 Generating security report...');
    const report = await zap.core.htmlreport();

    console.log('✅ Security scan completed');
    console.log('📄 Report generated');

  } catch (error) {
    console.error('❌ Security scan failed:', error);
  }
}

runSecurityScan();
EOF

    echo "✅ Security test setup completed"
}

# Main execution
case $TEST_TYPE in
    "backend")
        setup_backend_tests
        ;;
    "frontend")
        setup_frontend_tests
        ;;
    "e2e")
        setup_e2e_tests
        ;;
    "performance")
        setup_performance_tests
        ;;
    "security")
        setup_security_tests
        ;;
    "all")
        setup_backend_tests
        setup_frontend_tests
        setup_e2e_tests
        setup_performance_tests
        setup_security_tests
        ;;
    *)
        echo "❌ Invalid test type: $TEST_TYPE"
        echo "Usage: ./scripts/test-setup.sh [backend|frontend|e2e|performance|security|all]"
        exit 1
        ;;
esac

echo "🎉 Test setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Run backend tests: npm run test:backend"
echo "  2. Run frontend tests: npm run test:frontend"
echo "  3. Run E2E tests: npm run test:e2e"
echo "  4. Run performance tests: npm run test:performance"
echo "  5. Run security tests: npm run test:security"
echo ""
echo "🔧 Test configuration files created:"
echo "  - Backend: jest.config.js, test database"
echo "  - Frontend: jest.config.js, jest.setup.js"
echo "  - E2E: playwright.config.ts"
echo "  - Performance: k6 load tests"
echo "  - Security: OWASP ZAP integration"
