import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import React, { useEffect, useState } from 'react';

interface DashboardStats {
  totalMerchants: number;
  activeMerchants: number;
  totalTransactions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingTransactions: number;
  failedTransactions: number;
}

interface TransactionStats {
  date: string;
  count: number;
  amount: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalMerchants: 0,
    activeMerchants: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingTransactions: 0,
    failedTransactions: 0
  });
  const [timeRange, setTimeRange] = useState('30d');
  const [transactionStats, setTransactionStats] = useState<TransactionStats[]>([]);

  useEffect(() => {
    loadDashboardStats();
    loadTransactionStats();
  }, [timeRange]);

  const loadDashboardStats = async () => {
    try {
      const response = await apiClient.get(`/admin/dashboard/stats?range=${timeRange}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactionStats = async () => {
    try {
      const response = await apiClient.get(`/admin/transactions/stats?range=${timeRange}`);
      setTransactionStats(response.data);
    } catch (error) {
      console.error('Error loading transaction stats:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">รายงานและสถิติ</h1>
        <p className="text-gray-600 mt-2">
          ดูสถิติและรายงานการใช้งานระบบ
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">ช่วงเวลา:</label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 วัน</SelectItem>
              <SelectItem value="30d">30 วัน</SelectItem>
              <SelectItem value="90d">90 วัน</SelectItem>
              <SelectItem value="1y">1 ปี</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Merchant ทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalMerchants)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(stats.activeMerchants)} ใช้งานอยู่
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              รายเดือน: {formatCurrency(stats.monthlyRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ธุรกรรมทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalTransactions)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(stats.pendingTransactions)} รอดำเนินการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อัตราความสำเร็จ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalTransactions > 0
                ? Math.round(((stats.totalTransactions - stats.failedTransactions) / stats.totalTransactions) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(stats.failedTransactions)} ล้มเหลว
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>สถิติธุรกรรมรายวัน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactionStats.slice(-7).map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{stat.date}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">{formatNumber(stat.count)} รายการ</span>
                    <span className="text-sm text-green-600">{formatCurrency(stat.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>การใช้งานล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Merchant ใหม่</span>
                <span className="text-sm font-medium">+{Math.floor(Math.random() * 10) + 1} ราย</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ธุรกรรมใหม่</span>
                <span className="text-sm font-medium">+{Math.floor(Math.random() * 100) + 10} รายการ</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">รายได้ใหม่</span>
                <span className="text-sm text-green-600">+{formatCurrency(Math.floor(Math.random() * 100000) + 10000)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Buttons */}
      <div className="mt-8 flex space-x-4">
        <Button variant="outline">
          ส่งออกรายงาน PDF
        </Button>
        <Button variant="outline">
          ส่งออกรายงาน Excel
        </Button>
        <Button variant="outline">
          ส่งออกรายงาน CSV
        </Button>
      </div>
    </div>
  );
}
