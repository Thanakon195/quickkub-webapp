'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as LucideIcons from 'lucide-react';
import { useEffect, useState } from 'react';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  description: string;
  createdAt: string;
  customerEmail: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // TODO: Fetch payments from API
    setPayments([
      {
        id: 'pay_001',
        amount: 2500,
        currency: 'THB',
        status: 'completed',
        method: 'credit_card',
        description: 'Payment for Order #12345',
        createdAt: '2024-01-15T10:30:00Z',
        customerEmail: 'customer@example.com'
      },
      {
        id: 'pay_002',
        amount: 1500,
        currency: 'THB',
        status: 'pending',
        method: 'promptpay',
        description: 'Payment for Order #12344',
        createdAt: '2024-01-14T15:45:00Z',
        customerEmail: 'customer2@example.com'
      }
    ]);
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
    switch (status) {
      case 'completed':
        variant = 'default';
        break;
      case 'pending':
        variant = 'secondary';
        break;
      case 'failed':
        variant = 'destructive';
        break;
      case 'cancelled':
        variant = 'outline';
        break;
      default:
        variant = 'secondary';
    }
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getMethodIcon = (method: string) => {
    const icons = {
      credit_card: LucideIcons.CreditCard,
      promptpay: LucideIcons.QrCode,
      bank_transfer: LucideIcons.Banknote,
      crypto: LucideIcons.Bitcoin
    };
    const Icon = icons[method as keyof typeof icons] || LucideIcons.CreditCard;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payments</h1>
        <Button>
          <LucideIcons.Plus className="w-4 h-4 mr-2" />
          Create Payment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="status-select">Status</Label>
              <div>
                <select
                  id="status-select"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="all">All statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {getMethodIcon(payment.method)}
                  </div>
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <p className="text-sm text-muted-foreground">{payment.customerEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">฿{payment.amount.toLocaleString()}</p>
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
