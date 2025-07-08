import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface MerchantCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface MerchantFormData {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website: string;
  description: string;
  commissionRate: number;
  monthlyLimit: number;
}

export function MerchantCreateForm({ onSuccess, onCancel }: MerchantCreateFormProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<MerchantFormData>({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    website: '',
    description: '',
    commissionRate: 2.5,
    monthlyLimit: 1000000
  });

  const handleInputChange = (field: keyof MerchantFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await apiClient.post('/merchants', formData);
      toast.success('เพิ่ม Merchant ใหม่สำเร็จ');
      onSuccess?.();
    } catch (error) {
      toast.error('ไม่สามารถเพิ่ม Merchant ได้');
      console.error('Error creating merchant:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>เพิ่ม Merchant ใหม่</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">อีเมล *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">ชื่อธุรกิจ *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">ประเภทธุรกิจ *</Label>
              <Select
                value={formData.businessType}
                onValueChange={(value) => handleInputChange('businessType', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทธุรกิจ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">ร้านค้าปลีก</SelectItem>
                  <SelectItem value="ecommerce">อีคอมเมิร์ซ</SelectItem>
                  <SelectItem value="service">บริการ</SelectItem>
                  <SelectItem value="restaurant">ร้านอาหาร</SelectItem>
                  <SelectItem value="other">อื่นๆ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">เว็บไซต์</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ที่อยู่</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">ที่อยู่ *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">เมือง *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">จังหวัด *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">รหัสไปรษณีย์ *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">ประเทศ *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Business Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">การตั้งค่าธุรกิจ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commissionRate">อัตราคอมมิชชัน (%) *</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.commissionRate}
                  onChange={(e) => handleInputChange('commissionRate', parseFloat(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyLimit">วงเงินรายเดือน (บาท) *</Label>
                <Input
                  id="monthlyLimit"
                  type="number"
                  min="0"
                  value={formData.monthlyLimit}
                  onChange={(e) => handleInputChange('monthlyLimit', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={saving}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? 'กำลังบันทึก...' : 'เพิ่ม Merchant'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
