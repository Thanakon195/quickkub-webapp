// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  companyName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// User Types
export interface User {
  id: string;
  email: string;
  companyName: string;
  tier: 'bronze' | 'silver' | 'gold';
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

// API Key Types
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  lastUsed?: string;
  createdAt: string;
}

export interface CreateApiKeyRequest {
  name: string;
  permissions: string[];
}

// Payment Types
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  provider: string;
  reference: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  amount: number;
  currency: string;
  provider: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, any>;
}

// Invoice Types
export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  dueDate: string;
  customerEmail?: string;
  customerName?: string;
  description?: string;
  qrCode?: string;
  paymentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceRequest {
  amount: number;
  currency: string;
  dueDate: string;
  customerEmail?: string;
  customerName?: string;
  description?: string;
}

// Webhook Types
export interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret?: string;
  lastDelivery?: string;
  deliveryCount: number;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookRequest {
  url: string;
  events: string[];
}

// Transaction Types
export interface Transaction {
  id: string;
  type: 'payment' | 'withdrawal' | 'refund' | 'fee';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  reference?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Wallet Types
export interface Wallet {
  balance: number;
  currency: string;
  pendingBalance: number;
  totalReceived: number;
  totalWithdrawn: number;
}

export interface WithdrawalRequest {
  amount: number;
  bankAccount: string;
  bankName: string;
  accountName: string;
}

// Analytics Types
export interface AnalyticsOverview {
  totalRevenue: number;
  totalTransactions: number;
  successRate: number;
  averageAmount: number;
  currency: string;
  period: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  transactions: number;
}

export interface TransactionData {
  date: string;
  count: number;
  amount: number;
  status: string;
}

// Common Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
