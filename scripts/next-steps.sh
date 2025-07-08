#!/bin/bash

# QuickKub Payment Gateway - Next Steps Script
# Usage: ./scripts/next-steps.sh [action]

set -e

ACTION=${1:-all}

echo "🚀 QuickKub Payment Gateway - ขั้นตอนถัดไป"

# Function to fix TypeScript issues
fix_typescript() {
    echo "🔧 Fixing TypeScript configuration..."
    cd frontend

    # Install missing React types
    npm install --save-dev @types/react @types/react-dom

    # Update tsconfig.json
    cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/utils/*": ["./utils/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

    echo "✅ TypeScript configuration updated"
}

# Function to create missing UI components
create_ui_components() {
    echo "🎨 Creating missing UI components..."
    cd frontend/components/ui

    # Create Modal component
    cat > Modal.tsx << 'EOF'
'use client';

import React, { useEffect } from 'react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        'relative bg-white rounded-lg shadow-xl w-full mx-4',
        sizeClasses[size],
        className
      )}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
EOF

    # Create Table component
    cat > Table.tsx << 'EOF'
'use client';

import React, { useState } from 'react';
import { cn } from '@/utils/cn';

interface Column<T> {
  key: string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T>({
  data,
  columns,
  sortable = false,
  pagination = false,
  pageSize = 10,
  className,
  onRowClick
}: TableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sorting
  const sortedData = React.useMemo(() => {
    if (!sortable || !sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortColumn];
      const bValue = (b as any)[sortColumn];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortable, sortColumn, sortDirection]);

  // Pagination
  const paginatedData = React.useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, pagination, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.sortable && sortable && 'cursor-pointer hover:bg-gray-100',
                    column.width
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && sortable && sortColumn === column.key && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        {sortDirection === 'asc' ? (
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  'hover:bg-gray-50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render
                      ? column.render((row as any)[column.key], row)
                      : (row as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
EOF

    # Create Form component
    cat > Form.tsx << 'EOF'
'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  options?: { value: string; label: string }[];
  error?: string;
}

interface FormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  submitText?: string;
  loading?: boolean;
  className?: string;
}

export const Form: React.FC<FormProps> = ({
  fields,
  onSubmit,
  submitText = 'Submit',
  loading = false,
  className
}) => {
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = (field: FormField, value: any): string => {
    if (field.required && !value) {
      return `${field.label} is required`;
    }

    if (value && field.validation) {
      if (field.validation.minLength && value.length < field.validation.minLength) {
        return `${field.label} must be at least ${field.validation.minLength} characters`;
      }

      if (field.validation.maxLength && value.length > field.validation.maxLength) {
        return `${field.label} must be no more than ${field.validation.maxLength} characters`;
      }

      if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
        return `${field.label} format is invalid`;
      }

      if (field.validation.min && Number(value) < field.validation.min) {
        return `${field.label} must be at least ${field.validation.min}`;
      }

      if (field.validation.max && Number(value) > field.validation.max) {
        return `${field.label} must be no more than ${field.validation.max}`;
      }
    }

    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);

    // If no errors, submit
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      name: field.name,
      placeholder: field.placeholder,
      required: field.required,
      value: formData[field.name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        handleInputChange(field.name, e.target.value),
      className: cn(
        'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
        errors[field.name] ? 'border-red-500' : 'border-gray-300'
      )
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
          />
        );

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            {...commonProps}
            type={field.type}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {fields.map(field => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
          {errors[field.name] && (
            <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : submitText}
      </button>
    </form>
  );
};
EOF

    echo "✅ UI components created"
}

# Function to create payment flow pages
create_payment_pages() {
    echo "💳 Creating payment flow pages..."
    cd frontend/app

    # Create payment directory
    mkdir -p payment

    # Create PaymentPage
    cat > payment/page.tsx << 'EOF'
'use client';

import React, { useState } from 'react';
import { PaymentMethodSelector, PaymentMethod } from '@/components/payment/PaymentMethodSelector';
import { QRCodeDisplay } from '@/components/payment/QRCodeDisplay';
import { Form } from '@/components/ui/Form';

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'promptpay',
    name: 'promptpay',
    displayName: 'PromptPay',
    description: 'สแกน QR Code เพื่อชำระเงิน',
    icon: '📱',
    color: '#0066CC',
    isPopular: true,
    isRecommended: true,
    minAmount: 1,
    maxAmount: 100000,
    processingTime: 1,
    feePercentage: 0,
    fixedFee: 0,
  },
  {
    id: 'kbank',
    name: 'kbank',
    displayName: 'KBank',
    description: 'โอนเงินผ่าน KBank Mobile Banking',
    icon: '🏦',
    color: '#1E3A8A',
    minAmount: 1,
    maxAmount: 50000,
    processingTime: 5,
    feePercentage: 0,
    fixedFee: 0,
  },
  {
    id: 'scb',
    name: 'scb',
    displayName: 'SCB Easy',
    description: 'ชำระผ่าน SCB Easy App',
    icon: '💳',
    color: '#059669',
    minAmount: 1,
    maxAmount: 100000,
    processingTime: 3,
    feePercentage: 0,
    fixedFee: 0,
  },
];

export default function PaymentPage() {
  const [amount, setAmount] = useState(1000);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setShowQR(false);
  };

  const handlePaymentSubmit = (data: any) => {
    // Mock payment creation
    const payment = {
      id: `payment-${Date.now()}`,
      amount: amount,
      method: selectedMethod,
      qrCodeData: '00020101021229370016A000000677010112011300660000000005802TH530336454031005802TH6304',
      merchantName: 'Test Merchant',
      referenceId: `REF-${Date.now()}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    };

    setPaymentData(payment);
    setShowQR(true);
  };

  const paymentFields = [
    {
      name: 'customerName',
      label: 'ชื่อลูกค้า',
      type: 'text' as const,
      placeholder: 'กรอกชื่อลูกค้า',
      required: true,
    },
    {
      name: 'customerEmail',
      label: 'อีเมล',
      type: 'email' as const,
      placeholder: 'customer@example.com',
      required: true,
    },
    {
      name: 'customerPhone',
      label: 'เบอร์โทรศัพท์',
      type: 'tel' as const,
      placeholder: '0812345678',
      required: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">ชำระเงิน</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลการชำระเงิน</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนเงิน (บาท)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  step="0.01"
                />
              </div>

              <Form
                fields={paymentFields}
                onSubmit={handlePaymentSubmit}
                submitText="สร้าง QR Code"
                className="mb-6"
              />
            </div>

            {/* Payment Method Selection */}
            <div>
              <PaymentMethodSelector
                methods={mockPaymentMethods}
                selectedMethod={selectedMethod}
                onMethodSelect={handleMethodSelect}
                amount={amount}
              />
            </div>
          </div>

          {/* QR Code Display */}
          {showQR && paymentData && (
            <div className="mt-8">
              <QRCodeDisplay
                qrCodeData={paymentData.qrCodeData}
                amount={paymentData.amount}
                merchantName={paymentData.merchantName}
                referenceId={paymentData.referenceId}
                expiresAt={paymentData.expiresAt}
                onRefresh={() => {
                  // Refresh QR code logic
                  console.log('Refreshing QR code...');
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
EOF

    # Create success page
    cat > payment/success/page.tsx << 'EOF'
'use client';

import React from 'react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">ชำระเงินสำเร็จ!</h1>
          <p className="text-gray-600 mb-6">การชำระเงินของคุณเสร็จสิ้นแล้ว</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600">
              <p>รหัสอ้างอิง: <span className="font-mono">REF-123456789</span></p>
              <p>จำนวนเงิน: <span className="font-semibold">฿1,000.00</span></p>
              <p>วันที่: <span>{new Date().toLocaleDateString('th-TH')}</span></p>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/payment"
              className="block w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              ชำระเงินใหม่
            </Link>
            <Link
              href="/"
              className="block w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF

    # Create failed page
    cat > payment/failed/page.tsx << 'EOF'
'use client';

import React from 'react';
import Link from 'next/link';

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">ชำระเงินไม่สำเร็จ</h1>
          <p className="text-gray-600 mb-6">เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองใหม่อีกครั้ง</p>

          <div className="space-y-3">
            <Link
              href="/payment"
              className="block w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              ลองใหม่อีกครั้ง
            </Link>
            <Link
              href="/"
              className="block w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF

    echo "✅ Payment pages created"
}

# Function to setup state management
setup_state_management() {
    echo "🔄 Setting up state management..."
    cd frontend

    # Install Zustand
    npm install zustand

    # Create stores directory
    mkdir -p stores

    # Create auth store
    cat > stores/useAuthStore.ts << 'EOF'
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // Mock API call
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            throw new Error('Login failed');
          }

          const data = await response.json();
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
EOF

    # Create payment store
    cat > stores/usePaymentStore.ts << 'EOF'
import { create } from 'zustand';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: string;
  merchantId: string;
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentState {
  currentPayment: Payment | null;
  paymentHistory: Payment[];
  isLoading: boolean;
  error: string | null;
  createPayment: (paymentData: Partial<Payment>) => Promise<Payment>;
  updatePaymentStatus: (paymentId: string, status: Payment['status']) => void;
  getPaymentHistory: (merchantId: string) => Promise<Payment[]>;
  clearError: () => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  currentPayment: null,
  paymentHistory: [],
  isLoading: false,
  error: null,

  createPayment: async (paymentData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const payment = await response.json();
      set({ currentPayment: payment, isLoading: false });
      return payment;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
      throw error;
    }
  },

  updatePaymentStatus: (paymentId: string, status: Payment['status']) => {
    set((state) => ({
      currentPayment: state.currentPayment?.id === paymentId
        ? { ...state.currentPayment, status }
        : state.currentPayment,
      paymentHistory: state.paymentHistory.map(payment =>
        payment.id === paymentId ? { ...payment, status } : payment
      ),
    }));
  },

  getPaymentHistory: async (merchantId: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/payments?merchantId=${merchantId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }

      const payments = await response.json();
      set({ paymentHistory: payments, isLoading: false });
      return payments;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
EOF

    echo "✅ State management setup complete"
}

# Function to setup API integration
setup_api_integration() {
    echo "🔗 Setting up API integration..."
    cd frontend

    # Create api directory
    mkdir -p lib/api

    # Create API client
    cat > lib/api/client.ts << 'EOF'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Payment APIs
  async createPayment(data: any) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPayment(id: string) {
    return this.request(`/payments/${id}`);
  }

  async getPayments(params?: Record<string, any>) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/payments?${searchParams}`);
  }

  async updatePaymentStatus(id: string, status: string) {
    return this.request(`/payments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Merchant APIs
  async getMerchants(params?: Record<string, any>) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/merchants?${searchParams}`);
  }

  async getMerchant(id: string) {
    return this.request(`/merchants/${id}`);
  }

  // Transaction APIs
  async getTransactions(params?: Record<string, any>) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/transactions?${searchParams}`);
  }

  async getTransaction(id: string) {
    return this.request(`/transactions/${id}`);
  }

  // Auth APIs
  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
EOF

    # Create payment API
    cat > lib/api/payments.ts << 'EOF'
import { apiClient } from './client';

export interface CreatePaymentRequest {
  amount: number;
  currency: string;
  paymentMethod: string;
  merchantId: string;
  customerId: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  merchantId: string;
  customerId: string;
  description?: string;
  metadata?: Record<string, any>;
  qrCodeData?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const paymentApi = {
  create: (data: CreatePaymentRequest): Promise<Payment> => {
    return apiClient.createPayment(data);
  },

  get: (id: string): Promise<Payment> => {
    return apiClient.getPayment(id);
  },

  list: (params?: Record<string, any>): Promise<Payment[]> => {
    return apiClient.getPayments(params);
  },

  updateStatus: (id: string, status: Payment['status']): Promise<Payment> => {
    return apiClient.updatePaymentStatus(id, status);
  },

  // Poll payment status
  pollStatus: async (id: string, onUpdate?: (payment: Payment) => void): Promise<Payment> => {
    const poll = async (): Promise<Payment> => {
      const payment = await apiClient.getPayment(id);

      if (onUpdate) {
        onUpdate(payment);
      }

      if (payment.status === 'pending' || payment.status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return poll();
      }

      return payment;
    };

    return poll();
  },
};
EOF

    echo "✅ API integration setup complete"
}

# Main execution
case $ACTION in
    "typescript")
        fix_typescript
        ;;
    "components")
        create_ui_components
        ;;
    "pages")
        create_payment_pages
        ;;
    "state")
        setup_state_management
        ;;
    "api")
        setup_api_integration
        ;;
    "all")
        fix_typescript
        create_ui_components
        create_payment_pages
        setup_state_management
        setup_api_integration
        ;;
    *)
        echo "❌ Invalid action: $ACTION"
        echo "Usage: ./scripts/next-steps.sh [typescript|components|pages|state|api|all]"
        exit 1
        ;;
esac

echo "🎉 Next steps completed successfully!"
echo ""
echo "📋 What was done:"
echo "  - Fixed TypeScript configuration"
echo "  - Created missing UI components (Modal, Table, Form)"
echo "  - Created payment flow pages"
echo "  - Setup Zustand state management"
echo "  - Setup API integration layer"
echo ""
echo "🚀 Next actions:"
echo "  1. Test the components: npm run dev"
echo "  2. Visit: http://localhost:3000/payment"
echo "  3. Test payment flow end-to-end"
echo "  4. Add more features as needed"
