import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Merchant {
  id: string;
  name: string;
  email: string;
  businessName: string;
  status: 'active' | 'suspended' | 'pending';
  commissionRate: number;
  monthlyLimit: number;
  createdAt: string;
}

export default function MerchantsPage() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    try {
      const response = await apiClient.get('/merchants');
      setMerchants(response.data);
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูล Merchant ได้');
      console.error('Error loading merchants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (merchantId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/merchants/${merchantId}/status`, { status: newStatus });
      toast.success('อัปเดตสถานะสำเร็จ');
      loadMerchants();
    } catch (error) {
      toast.error('ไม่สามารถอัปเดตสถานะได้');
      console.error('Error updating status:', error);
    }
  };

  const filteredMerchants = merchants.filter(merchant =>
    merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    merchant.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">เปิดใช้งาน</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">ระงับการใช้งาน</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">รอการอนุมัติ</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3">กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการ Merchant</h1>
          <p className="text-gray-600 mt-2">
            ดูและจัดการ Merchant ทั้งหมดในระบบ
          </p>
        </div>
        <Button onClick={() => router.push('/merchants/create')}>
          เพิ่ม Merchant ใหม่
        </Button>
      </div>
      {/* Search Bar */}
      <div className="mb-6">
        <Input
          placeholder="ค้นหา Merchant..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Merchants Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการ Merchant ({filteredMerchants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 font-medium">ชื่อ</th>
                  <th className="py-3 px-4 font-medium">อีเมล</th>
                  <th className="py-3 px-4 font-medium">ชื่อธุรกิจ</th>
                  <th className="py-3 px-4 font-medium">สถานะ</th>
                  <th className="py-3 px-4 font-medium">คอมมิชชัน</th>
                  <th className="py-3 px-4 font-medium">วงเงินรายเดือน</th>
                  <th className="py-3 px-4 font-medium">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredMerchants.map((merchant) => (
                  <tr key={merchant.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{merchant.name}</div>
                        <div className="text-sm text-gray-500">
                          สร้างเมื่อ {new Date(merchant.createdAt).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{merchant.email}</td>
                    <td className="py-3 px-4">{merchant.businessName}</td>
                    <td className="py-3 px-4">{getStatusBadge(merchant.status)}</td>
                    <td className="py-3 px-4">{merchant.commissionRate}%</td>
                    <td className="py-3 px-4">
                      {new Intl.NumberFormat('th-TH', {
                        style: 'currency',
                        currency: 'THB'
                      }).format(merchant.monthlyLimit)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/merchants/${merchant.id}`)}
                        >
                          ดู
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/merchants/${merchant.id}/edit`)}
                        >
                          แก้ไข
                        </Button>
                        {merchant.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(merchant.id, 'suspended')}
                            className="text-red-600 hover:text-red-700"
                          >
                            ระงับ
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(merchant.id, 'active')}
                            className="text-green-600 hover:text-green-700"
                          >
                            เปิดใช้งาน
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMerchants.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              ไม่พบ Merchant ที่ตรงกับคำค้นหา
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
