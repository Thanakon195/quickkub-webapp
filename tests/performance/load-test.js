import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be less than 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3002';

export default function () {
  // Health check
  const healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);

  // API documentation
  const docsResponse = http.get(`${BASE_URL}/docs`);
  check(docsResponse, {
    'docs status is 200': (r) => r.status === 200,
    'docs response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(1);

  // Payments endpoint (if authenticated)
  const paymentsResponse = http.get(`${BASE_URL}/api/v1/payments`);
  check(paymentsResponse, {
    'payments status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'payments response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(1);

  // Merchants endpoint
  const merchantsResponse = http.get(`${BASE_URL}/api/v1/merchants`);
  check(merchantsResponse, {
    'merchants status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'merchants response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}
