'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalTransactions: number;
  totalAmount: number;
  successRate: number;
  pendingPayments: number;
  recentTransactions: Array<{
    id: string;
    amount: number;
    status: string;
    date: string;
    description: string;
  }>;
}

const ArrowUpRight: any = LucideIcons.ArrowUpRight;
const ArrowDownRight: any = LucideIcons.ArrowDownRight;
const CreditCard: any = LucideIcons.CreditCard;
const DollarSign: any = LucideIcons.DollarSign;
const TrendingUp: any = LucideIcons.TrendingUp;
const Activity: any = LucideIcons.Activity;

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    totalAmount: 0,
    successRate: 0,
    pendingPayments: 0,
    recentTransactions: []
  });

  useEffect(() => {
    // TODO: Fetch dashboard data from API
    setStats({
      totalTransactions: 1250,
      totalAmount: 1250000,
      successRate: 98.5,
      pendingPayments: 5,
      recentTransactions: [
        {
          id: 'txn_001',
          amount: 2500,
          status: 'completed',
          date: '2024-01-15',
          description: 'Payment for Order #12345'
        },
        {
          id: 'txn_002',
          amount: 1500,
          status: 'pending',
          date: '2024-01-14',
          description: 'Payment for Order #12344'
        }
      ]
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button>
          <ArrowUpRight className="w-4 h-4 mr-2" />
          New Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="inline w-3 h-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{stats.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="inline w-3 h-3 mr-1" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="inline w-3 h-3 mr-1" />
              +2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowDownRight className="inline w-3 h-3 mr-1" />
              -3 from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <CreditCard className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">฿{transaction.amount.toLocaleString()}</p>
                  <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
