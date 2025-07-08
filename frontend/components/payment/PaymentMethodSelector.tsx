'use client';

import { cn } from '@/utils/cn';
import React, { useState } from 'react';

export interface PaymentMethod {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  isPopular?: boolean;
  isRecommended?: boolean;
  minAmount: number;
  maxAmount: number;
  processingTime: number;
  feePercentage: number;
  fixedFee: number;
}

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedMethod?: string;
  onMethodSelect: (methodId: string) => void;
  amount: number;
  className?: string;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  methods,
  selectedMethod,
  onMethodSelect,
  amount,
  className
}) => {
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);

  const getMethodStatus = (method: PaymentMethod) => {
    if (amount < method.minAmount) {
      return {
        status: 'disabled' as const,
        message: `ขั้นต่ำ ${method.minAmount.toLocaleString()} บาท`
      };
    }
    if (amount > method.maxAmount) {
      return {
        status: 'disabled' as const,
        message: `สูงสุด ${method.maxAmount.toLocaleString()} บาท`
      };
    }
    return {
      status: 'available' as const,
      message: `ค่าธรรมเนียม ${method.feePercentage}% + ${method.fixedFee} บาท`
    };
  };

  const calculateFee = (method: PaymentMethod) => {
    const percentageFee = (amount * method.feePercentage) / 100;
    return percentageFee + method.fixedFee;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">เลือกวิธีการชำระเงิน</h3>
        <span className="text-sm text-gray-500">จำนวนเงิน: {amount.toLocaleString()} บาท</span>
      </div>

      <div className="grid gap-3">
        {methods.map((method) => {
          const methodStatus = getMethodStatus(method);
          const isDisabled = methodStatus.status === 'disabled';
          const isSelected = selectedMethod === method.id;
          const isHovered = hoveredMethod === method.id;

          return (
            <div
              key={method.id}
              className={cn(
                'relative p-4 border rounded-lg cursor-pointer transition-all duration-200',
                {
                  'border-blue-500 bg-blue-50': isSelected,
                  'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50': !isSelected && !isDisabled,
                  'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60': isDisabled,
                }
              )}
              onClick={() => !isDisabled && onMethodSelect(method.id)}
              onMouseEnter={() => setHoveredMethod(method.id)}
              onMouseLeave={() => setHoveredMethod(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Method Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: method.color }}
                  >
                    <span className="text-white text-lg">{method.icon}</span>
                  </div>

                  {/* Method Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{method.displayName}</h4>
                      {method.isPopular && (
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                          ยอดนิยม
                        </span>
                      )}
                      {method.isRecommended && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          แนะนำ
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      ใช้เวลา {method.processingTime} นาที
                    </p>
                  </div>
                </div>

                {/* Fee and Selection */}
                <div className="text-right">
                  {!isDisabled && (
                    <div className="text-sm text-gray-600">
                      ค่าธรรมเนียม: {calculateFee(method).toFixed(2)} บาท
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {methodStatus.message}
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="mt-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hover Effect */}
              {isHovered && !isDisabled && !isSelected && (
                <div className="absolute inset-0 border-2 border-blue-300 rounded-lg pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {selectedMethod && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              วิธีการชำระเงินที่เลือก
            </span>
            <span className="text-sm text-blue-700">
              {methods.find(m => m.id === selectedMethod)?.displayName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
