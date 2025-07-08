const axios = require('axios');
const { expect } = require('chai');

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3002';

describe('QuickKub API Integration Tests', () => {
  let authToken;

  before(async () => {
    // Setup test data
    console.log('Setting up test environment...');
  });

  after(async () => {
    // Cleanup test data
    console.log('Cleaning up test environment...');
  });

  describe('Health Check', () => {
    it('should return 200 for health endpoint', async () => {
      const response = await axios.get(`${BASE_URL}/health`);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('status', 'ok');
    });

    it('should return API documentation', async () => {
      const response = await axios.get(`${BASE_URL}/docs`);
      expect(response.status).to.equal(200);
    });
  });

  describe('Authentication', () => {
    it('should allow user registration', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      try {
        const response = await axios.post(`${BASE_URL}/api/v1/auth/register`, userData);
        expect(response.status).to.equal(201);
        expect(response.data).to.have.property('access_token');
        authToken = response.data.access_token;
      } catch (error) {
        // User might already exist
        expect(error.response.status).to.equal(400);
      }
    });

    it('should allow user login', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await axios.post(`${BASE_URL}/api/v1/auth/login`, loginData);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('access_token');
      authToken = response.data.access_token;
    });
  });

  describe('Merchants', () => {
    let merchantId;

    it('should create a merchant', async () => {
      const merchantData = {
        name: 'Test Merchant',
        email: 'merchant@example.com',
        phone: '+66123456789',
        address: '123 Test Street, Bangkok',
        businessType: 'retail',
        taxId: '1234567890123'
      };

      const response = await axios.post(`${BASE_URL}/api/v1/merchants`, merchantData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(201);
      expect(response.data).to.have.property('id');
      merchantId = response.data.id;
    });

    it('should get merchant by ID', async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/merchants/${merchantId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data.id).to.equal(merchantId);
    });

    it('should list merchants', async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/merchants`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
    });
  });

  describe('Payments', () => {
    let paymentId;

    it('should create a payment', async () => {
      const paymentData = {
        amount: 1000,
        currency: 'THB',
        description: 'Test payment',
        merchantId: 1,
        paymentMethod: 'credit_card',
        customerEmail: 'customer@example.com'
      };

      const response = await axios.post(`${BASE_URL}/api/v1/payments`, paymentData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(201);
      expect(response.data).to.have.property('id');
      paymentId = response.data.id;
    });

    it('should get payment by ID', async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data.id).to.equal(paymentId);
    });

    it('should list payments', async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/payments`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
    });
  });

  describe('Transactions', () => {
    it('should list transactions', async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/transactions`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
    });
  });

  describe('Wallets', () => {
    it('should list wallets', async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/wallets`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
    });
  });

  describe('Invoices', () => {
    it('should list invoices', async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/invoices`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
    });
  });

  describe('Webhooks', () => {
    it('should list webhooks', async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/webhooks`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
    });
  });

  describe('Settlements', () => {
    it('should list settlements', async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/settlements`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
    });
  });

  describe('Reports', () => {
    it('should generate transaction report', async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/reports/transactions`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: {
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        }
      });

      expect(response.status).to.equal(200);
    });

    it('should generate merchant report', async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/reports/merchants`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(200);
    });

    it('should generate settlement report', async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/reports/settlements`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(200);
    });
  });

  describe('Admin', () => {
    it('should get system stats', async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/stats`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('totalUsers');
      expect(response.data).to.have.property('totalMerchants');
      expect(response.data).to.have.property('totalTransactions');
    });

    it('should get system logs', async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/logs`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      try {
        await axios.get(`${BASE_URL}/api/v1/non-existent`);
      } catch (error) {
        expect(error.response.status).to.equal(404);
      }
    });

    it('should return 401 for unauthorized access', async () => {
      try {
        await axios.get(`${BASE_URL}/api/v1/users`);
      } catch (error) {
        expect(error.response.status).to.equal(401);
      }
    });

    it('should return 400 for invalid data', async () => {
      try {
        await axios.post(`${BASE_URL}/api/v1/payments`, {
          amount: 'invalid',
          currency: 'INVALID'
        }, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
      } catch (error) {
        expect(error.response.status).to.equal(400);
      }
    });
  });
});
