import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },

  // Merchant
  merchant: {
    profile: '/merchant/profile',
    update: '/merchant/profile',
    apiKeys: '/merchant/api-keys',
    createApiKey: '/merchant/api-keys',
    deleteApiKey: (id: string) => `/merchant/api-keys/${id}`,
  },

  // Payments
  payments: {
    create: '/payments/create',
    status: (id: string) => `/payments/${id}/status`,
    list: '/payments',
    webhooks: '/payments/webhooks',
  },

  // Invoices
  invoices: {
    create: '/invoices/create',
    list: '/invoices',
    detail: (id: string) => `/invoices/${id}`,
    qr: (id: string) => `/invoices/${id}/qr`,
  },

  // Webhooks
  webhooks: {
    list: '/webhooks',
    create: '/webhooks',
    update: (id: string) => `/webhooks/${id}`,
    delete: (id: string) => `/webhooks/${id}`,
    test: (id: string) => `/webhooks/${id}/test`,
  },

  // Transactions
  transactions: {
    list: '/transactions',
    detail: (id: string) => `/transactions/${id}`,
    export: '/transactions/export',
  },

  // Wallet
  wallet: {
    balance: '/wallet/balance',
    history: '/wallet/history',
    withdraw: '/wallet/withdraw',
  },

  // Analytics
  analytics: {
    overview: '/analytics/overview',
    revenue: '/analytics/revenue',
    transactions: '/analytics/transactions',
  },
};

// API functions
export const apiClient = {
  // Auth
  login: (data: { email: string; password: string }) =>
    api.post(endpoints.auth.login, data),

  register: (data: { email: string; password: string; companyName: string }) =>
    api.post(endpoints.auth.register, data),

  refreshToken: (refreshToken: string) =>
    api.post(endpoints.auth.refresh, { refreshToken }),

  logout: () => api.post(endpoints.auth.logout),

  // Merchant
  getProfile: () => api.get(endpoints.merchant.profile),
  updateProfile: (data: Record<string, unknown>) => api.put(endpoints.merchant.update, data),

  // API Keys
  getApiKeys: () => api.get(endpoints.merchant.apiKeys),
  createApiKey: (data: { name: string; permissions: string[] }) =>
    api.post(endpoints.merchant.createApiKey, data),
  deleteApiKey: (id: string) => api.delete(endpoints.merchant.deleteApiKey(id)),

  // Payments
  createPayment: (data: Record<string, unknown>) => api.post(endpoints.payments.create, data),
  getPaymentStatus: (id: string) => api.get(endpoints.payments.status(id)),
  getPayments: (params?: Record<string, unknown>) => api.get(endpoints.payments.list, { params }),

  // Invoices
  createInvoice: (data: Record<string, unknown>) => api.post(endpoints.invoices.create, data),
  getInvoices: (params?: Record<string, unknown>) => api.get(endpoints.invoices.list, { params }),
  getInvoice: (id: string) => api.get(endpoints.invoices.detail(id)),
  getInvoiceQR: (id: string) => api.get(endpoints.invoices.qr(id)),

  // Webhooks
  getWebhooks: () => api.get(endpoints.webhooks.list),
  createWebhook: (data: Record<string, unknown>) => api.post(endpoints.webhooks.create, data),
  updateWebhook: (id: string, data: Record<string, unknown>) => api.put(endpoints.webhooks.update(id), data),
  deleteWebhook: (id: string) => api.delete(endpoints.webhooks.delete(id)),
  testWebhook: (id: string) => api.post(endpoints.webhooks.test(id)),

  // Transactions
  getTransactions: (params?: Record<string, unknown>) => api.get(endpoints.transactions.list, { params }),
  getTransaction: (id: string) => api.get(endpoints.transactions.detail(id)),
  exportTransactions: (params?: Record<string, unknown>) => api.get(endpoints.transactions.export, { params }),

  // Wallet
  getBalance: () => api.get(endpoints.wallet.balance),
  getWalletHistory: (params?: Record<string, unknown>) => api.get(endpoints.wallet.history, { params }),
  createWithdrawal: (data: Record<string, unknown>) => api.post(endpoints.wallet.withdraw, data),

  // Analytics
  getAnalyticsOverview: (params?: Record<string, unknown>) => api.get(endpoints.analytics.overview, { params }),
  getRevenueAnalytics: (params?: Record<string, unknown>) => api.get(endpoints.analytics.revenue, { params }),
  getTransactionAnalytics: (params?: Record<string, unknown>) => api.get(endpoints.analytics.transactions, { params }),
};
