'use client';

import { cn } from '@/utils/cn';
import React, { useEffect, useState } from 'react';

interface QRCodeDisplayProps {
  qrCodeData: string;
  amount: number;
  merchantName: string;
  referenceId: string;
  expiresAt: Date;
  onRefresh?: () => void;
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrCodeData,
  amount,
  merchantName,
  referenceId,
  expiresAt,
  onRefresh,
  className
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference > 0) {
        setTimeLeft(Math.floor(difference / 1000));
        setIsExpired(false);
      } else {
        setTimeLeft(0);
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeData);
      // You can add a toast notification here
    } catch (err) {
      console.error('Failed to copy QR code data:', err);
    }
  };

  return (
    <div className={cn('bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto', className)}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">PromptPay QR Code</h2>
        <p className="text-sm text-gray-600 mt-1">สแกน QR Code เพื่อชำระเงิน</p>
      </div>

      {/* QR Code */}
      <div className="text-center mb-6">
        <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
          {isExpired ? (
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-gray-500">QR Code หมดอายุ</p>
              </div>
            </div>
          ) : (
            <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
              {/* Placeholder for actual QR code image */}
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">QR Code</span>
                </div>
                <p className="text-xs text-gray-500">สแกนด้วยแอปธนาคาร</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">ร้านค้า:</span>
          <span className="text-sm font-medium text-gray-900">{merchantName}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">จำนวนเงิน:</span>
          <span className="text-lg font-bold text-gray-900">฿{amount.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">รหัสอ้างอิง:</span>
          <span className="text-sm font-mono text-gray-700">{referenceId}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">หมดอายุใน:</span>
          <span className={cn(
            'text-sm font-medium',
            timeLeft < 60 ? 'text-red-600' : 'text-gray-900'
          )}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {!isExpired && (
          <>
            <button
              onClick={copyToClipboard}
              className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              คัดลอก QR Code Data
            </button>

            {onRefresh && (
              <button
                onClick={onRefresh}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                สร้าง QR Code ใหม่
              </button>
            )}
          </>
        )}

        {isExpired && onRefresh && (
          <button
            onClick={onRefresh}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            สร้าง QR Code ใหม่
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">วิธีการชำระเงิน:</h4>
        <ol className="text-xs text-blue-800 space-y-1">
          <li>1. เปิดแอปธนาคารของคุณ</li>
          <li>2. เลือก "สแกน QR Code"</li>
          <li>3. สแกน QR Code ด้านบน</li>
          <li>4. ตรวจสอบข้อมูลและยืนยันการชำระเงิน</li>
          <li>5. รอการยืนยันจากระบบ</li>
        </ol>
      </div>
    </div>
  );
};
