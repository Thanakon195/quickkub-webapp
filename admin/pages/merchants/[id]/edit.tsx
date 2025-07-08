import { MerchantEditForm } from '@/components/forms/MerchantEditForm';
import { useRouter } from 'next/router';
import React from 'react';

export default function EditMerchantPage() {
  const router = useRouter();
  const { id } = router.query;

  const handleSuccess = () => {
    router.push(`/merchants/${id}`);
  };

  const handleCancel = () => {
    router.push(`/merchants/${id}`);
  };

  if (!id || typeof id !== 'string') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">ไม่พบ Merchant ID</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">แก้ไขข้อมูล Merchant</h1>
        <p className="text-gray-600 mt-2">
          แก้ไขข้อมูล Merchant ID: {id}
        </p>
      </div>

      <MerchantEditForm
        merchantId={id}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
