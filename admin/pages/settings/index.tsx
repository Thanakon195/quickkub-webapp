import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/lib/api-client';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SystemSettings {
  // General Settings
  systemName: string;
  systemEmail: string;
  supportPhone: string;
  supportEmail: string;

  // Payment Settings
  defaultCommissionRate: number;
  minimumTransactionAmount: number;
  maximumTransactionAmount: number;
  autoSettlementEnabled: boolean;
  settlementThreshold: number;

  // Security Settings
  passwordMinLength: number;
  sessionTimeout: number;
  mfaRequired: boolean;
  ipWhitelistEnabled: boolean;

  // Notification Settings
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  webhookNotificationsEnabled: boolean;

  // API Settings
  apiRateLimit: number;
  webhookTimeout: number;
  webhookRetryAttempts: number;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SystemSettings>({
    systemName: 'QuickKub Payment Gateway',
    systemEmail: 'admin@quickkub.com',
    supportPhone: '+66-2-123-4567',
    supportEmail: 'support@quickkub.com',
    defaultCommissionRate: 2.5,
    minimumTransactionAmount: 1,
    maximumTransactionAmount: 1000000,
    autoSettlementEnabled: true,
    settlementThreshold: 10000,
    passwordMinLength: 8,
    sessionTimeout: 30,
    mfaRequired: false,
    ipWhitelistEnabled: false,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    webhookNotificationsEnabled: true,
    apiRateLimit: 1000,
    webhookTimeout: 30,
    webhookRetryAttempts: 3
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiClient.get('/admin/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('ไม่สามารถโหลดการตั้งค่าได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put('/admin/settings', settings);
      toast.success('บันทึกการตั้งค่าสำเร็จ');
    } catch (error) {
      toast.error('ไม่สามารถบันทึกการตั้งค่าได้');
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'ทั่วไป' },
    { id: 'payment', label: 'การชำระเงิน' },
    { id: 'security', label: 'ความปลอดภัย' },
    { id: 'notifications', label: 'การแจ้งเตือน' },
    { id: 'api', label: 'API' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3">กำลังโหลดการตั้งค่า...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">การตั้งค่าระบบ</h1>
        <p className="text-gray-600 mt-2">
          จัดการการตั้งค่าต่างๆ ของระบบ
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'general' && (
          <Card>
            <CardHeader>
              <CardTitle>การตั้งค่าทั่วไป</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systemName">ชื่อระบบ</Label>
                  <Input
                    id="systemName"
                    value={settings.systemName}
                    onChange={(e) => handleSettingChange('systemName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="systemEmail">อีเมลระบบ</Label>
                  <Input
                    id="systemEmail"
                    type="email"
                    value={settings.systemEmail}
                    onChange={(e) => handleSettingChange('systemEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">เบอร์โทรศัพท์สนับสนุน</Label>
                  <Input
                    id="supportPhone"
                    value={settings.supportPhone}
                    onChange={(e) => handleSettingChange('supportPhone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">อีเมลสนับสนุน</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle>การตั้งค่าการชำระเงิน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultCommissionRate">อัตราคอมมิชชันเริ่มต้น (%)</Label>
                  <Input
                    id="defaultCommissionRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.defaultCommissionRate}
                    onChange={(e) => handleSettingChange('defaultCommissionRate', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumTransactionAmount">จำนวนเงินขั้นต่ำ (บาท)</Label>
                  <Input
                    id="minimumTransactionAmount"
                    type="number"
                    min="0"
                    value={settings.minimumTransactionAmount}
                    onChange={(e) => handleSettingChange('minimumTransactionAmount', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maximumTransactionAmount">จำนวนเงินสูงสุด (บาท)</Label>
                  <Input
                    id="maximumTransactionAmount"
                    type="number"
                    min="0"
                    value={settings.maximumTransactionAmount}
                    onChange={(e) => handleSettingChange('maximumTransactionAmount', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settlementThreshold">เกณฑ์การ Settlement (บาท)</Label>
                  <Input
                    id="settlementThreshold"
                    type="number"
                    min="0"
                    value={settings.settlementThreshold}
                    onChange={(e) => handleSettingChange('settlementThreshold', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoSettlementEnabled"
                  checked={settings.autoSettlementEnabled}
                  onCheckedChange={(checked) => handleSettingChange('autoSettlementEnabled', checked)}
                />
                <Label htmlFor="autoSettlementEnabled">เปิดใช้งาน Settlement อัตโนมัติ</Label>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle>การตั้งค่าความปลอดภัย</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">ความยาวรหัสผ่านขั้นต่ำ</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="6"
                    max="20"
                    value={settings.passwordMinLength}
                    onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">เวลาหมดอายุ Session (นาที)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="mfaRequired"
                  checked={settings.mfaRequired}
                  onCheckedChange={(checked) => handleSettingChange('mfaRequired', checked)}
                />
                <Label htmlFor="mfaRequired">บังคับใช้ MFA สำหรับผู้ดูแลระบบ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="ipWhitelistEnabled"
                  checked={settings.ipWhitelistEnabled}
                  onCheckedChange={(checked) => handleSettingChange('ipWhitelistEnabled', checked)}
                />
                <Label htmlFor="ipWhitelistEnabled">เปิดใช้งาน IP Whitelist</Label>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>การตั้งค่าการแจ้งเตือน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="emailNotificationsEnabled"
                  checked={settings.emailNotificationsEnabled}
                  onCheckedChange={(checked) => handleSettingChange('emailNotificationsEnabled', checked)}
                />
                <Label htmlFor="emailNotificationsEnabled">เปิดใช้งานการแจ้งเตือนทางอีเมล</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="smsNotificationsEnabled"
                  checked={settings.smsNotificationsEnabled}
                  onCheckedChange={(checked) => handleSettingChange('smsNotificationsEnabled', checked)}
                />
                <Label htmlFor="smsNotificationsEnabled">เปิดใช้งานการแจ้งเตือนทาง SMS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="webhookNotificationsEnabled"
                  checked={settings.webhookNotificationsEnabled}
                  onCheckedChange={(checked) => handleSettingChange('webhookNotificationsEnabled', checked)}
                />
                <Label htmlFor="webhookNotificationsEnabled">เปิดใช้งานการแจ้งเตือนทาง Webhook</Label>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'api' && (
          <Card>
            <CardHeader>
              <CardTitle>การตั้งค่า API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apiRateLimit">Rate Limit (คำขอ/นาที)</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    min="1"
                    max="10000"
                    value={settings.apiRateLimit}
                    onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhookTimeout">Webhook Timeout (วินาที)</Label>
                  <Input
                    id="webhookTimeout"
                    type="number"
                    min="5"
                    max="300"
                    value={settings.webhookTimeout}
                    onChange={(e) => handleSettingChange('webhookTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhookRetryAttempts">จำนวนครั้งที่ Retry Webhook</Label>
                  <Input
                    id="webhookRetryAttempts"
                    type="number"
                    min="0"
                    max="10"
                    value={settings.webhookRetryAttempts}
                    onChange={(e) => handleSettingChange('webhookRetryAttempts', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="px-6"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </Button>
      </div>
    </div>
  );
}
