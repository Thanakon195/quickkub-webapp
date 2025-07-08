const axios = require('axios');
const { expect } = require('chai');

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3002';

describe('QuickKub Smoke Tests', () => {
  describe('Basic Connectivity', () => {
    it('should be able to reach the API', async () => {
      const response = await axios.get(`${BASE_URL}/health`);
      expect(response.status).to.equal(200);
    });

    it('should have API documentation available', async () => {
      const response = await axios.get(`${BASE_URL}/docs`);
      expect(response.status).to.equal(200);
    });

    it('should respond to root endpoint', async () => {
      const response = await axios.get(`${BASE_URL}/`);
      expect(response.status).to.equal(200);
    });
  });

  describe('Database Connectivity', () => {
    it('should be able to connect to database', async () => {
      const response = await axios.get(`${BASE_URL}/health`);
      expect(response.data).to.have.property('database', 'connected');
    });
  });

  describe('Redis Connectivity', () => {
    it('should be able to connect to Redis', async () => {
      const response = await axios.get(`${BASE_URL}/health`);
      expect(response.data).to.have.property('redis', 'connected');
    });
  });

  describe('Core Endpoints', () => {
    it('should have auth endpoints available', async () => {
      try {
        await axios.post(`${BASE_URL}/api/v1/auth/login`, {
          email: 'test@example.com',
          password: 'password123'
        });
      } catch (error) {
        // Should return 401 for invalid credentials, not 404
        expect(error.response.status).to.equal(401);
      }
    });

    it('should have merchants endpoint available', async () => {
      try {
        await axios.get(`${BASE_URL}/api/v1/merchants`);
      } catch (error) {
        // Should return 401 for unauthorized, not 404
        expect(error.response.status).to.equal(401);
      }
    });

    it('should have payments endpoint available', async () => {
      try {
        await axios.get(`${BASE_URL}/api/v1/payments`);
      } catch (error) {
        // Should return 401 for unauthorized, not 404
        expect(error.response.status).to.equal(401);
      }
    });
  });

  describe('Frontend Connectivity', () => {
    it('should be able to reach frontend', async () => {
      const response = await axios.get('http://localhost:3000');
      expect(response.status).to.equal(200);
    });
  });

  describe('Admin Panel Connectivity', () => {
    it('should be able to reach admin panel', async () => {
      const response = await axios.get('http://localhost:3001');
      expect(response.status).to.equal(200);
    });
  });

  describe('Monitoring Tools', () => {
    it('should have pgAdmin available', async () => {
      const response = await axios.get('http://localhost:8080');
      expect(response.status).to.equal(200);
    });

    it('should have Redis Commander available', async () => {
      const response = await axios.get('http://localhost:8081');
      expect(response.status).to.equal(200);
    });

    it('should have Bull Board available', async () => {
      const response = await axios.get('http://localhost:8082');
      expect(response.status).to.equal(200);
    });

    it('should have MinIO Console available', async () => {
      const response = await axios.get('http://localhost:9001');
      expect(response.status).to.equal(200);
    });
  });
});
