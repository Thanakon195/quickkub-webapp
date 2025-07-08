import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminAccessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminAccessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  auth: {
    login: '/admin/auth/login',
    logout: '/admin/auth/logout',
    me: '/admin/auth/me',
  },
  merchants: {
    list: '/admin/merchants',
    detail: (id: string) => `/admin/merchants/${id}`,
    approve: (id: string) => `/admin/merchants/${id}/approve`,
    suspend: (id: string) => `/admin/merchants/${id}/suspend`,
    kyc: (id: string) => `/admin/merchants/${id}/kyc`,
  },
  transactions: {
    list: '/admin/transactions',
    detail: (id: string) => `/admin/transactions/${id}`,
    export: '/admin/transactions/export',
  },
  reports: {
    settlement: '/admin/reports/settlement',
    audit: '/admin/reports/audit',
  },
  settings: {
    fees: '/admin/settings/fees',
    tiers: '/admin/settings/tiers',
    plans: '/admin/settings/plans',
  },
  notifications: {
    list: '/admin/notifications',
  },
};
