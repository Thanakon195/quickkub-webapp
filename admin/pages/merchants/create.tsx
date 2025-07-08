import { MerchantCreateForm } from '@/components/forms/MerchantCreateForm';
import { useRouter } from 'next/router';
import React from 'react';

export default function CreateMerchantPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/merchants');
  };

  const handleCancel = () => {
    router.push('/merchants');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">เพิ่ม Merchant ใหม่</h1>
        <p className="text-gray-600 mt-2">
          กรอกข้อมูลเพื่อเพิ่ม Merchant ใหม่เข้าระบบ
        </p>
      </div>

      <MerchantCreateForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
