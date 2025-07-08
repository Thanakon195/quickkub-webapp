'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as LucideIcons from 'lucide-react';
import { useEffect, useState } from 'react';

interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  description: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    // TODO: Fetch transactions from API
    setTransactions([
      {
        id: 'txn_001',
        transactionId: 'TXN-2024-001',
        amount: 2500,
        currency: 'THB',
        status: 'completed',
        type: 'payment',
        description: 'Payment for Order #12345',
        createdAt: '2024-01-15T10:30:00Z',
        customerName: 'John Doe',
        customerEmail: 'john@example.com'
      },
      {
        id: 'txn_002',
        transactionId: 'TXN-2024-002',
        amount: 1500,
        currency: 'THB',
        status: 'pending',
        type: 'payment',
        description: 'Payment for Order #12344',
        createdAt: '2024-01-14T15:45:00Z',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com'
      },
      {
        id: 'txn_003',
        transactionId: 'TXN-2024-003',
        amount: 500,
        currency: 'THB',
        status: 'refunded',
        type: 'refund',
        description: 'Refund for Order #12343',
        createdAt: '2024-01-13T09:15:00Z',
        customerName: 'Bob Wilson',
        customerEmail: 'bob@example.com'
      }
    ]);
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
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
      case 'refunded':
        variant = 'secondary';
        break;
      default:
        variant = 'secondary';
    }
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    let variant: 'default' | 'secondary' | 'outline' = 'secondary';
    switch (type) {
      case 'payment':
        variant = 'default';
        break;
      case 'refund':
        variant = 'secondary';
        break;
      case 'withdrawal':
        variant = 'outline';
        break;
      case 'deposit':
        variant = 'default';
        break;
      default:
        variant = 'secondary';
    }
    return <Badge variant={variant}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Button>
          <LucideIcons.Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-select">Status</Label>
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
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <Label htmlFor="type-select">Type</Label>
              <select
                id="type-select"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full border rounded px-2 py-1"
              >
                <option value="all">All types</option>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="deposit">Deposit</option>
              </select>
            </div>
            <div>
              <Label htmlFor="date">Date Range</Label>
              <Button variant="outline" className="w-full justify-start">
                <LucideIcons.Calendar className="w-4 h-4 mr-2" />
                Last 30 days
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <LucideIcons.Receipt className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.customerName} • {transaction.customerEmail}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.transactionId} • {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">฿{transaction.amount.toLocaleString()}</p>
                  <div className="flex gap-2 mt-1">
                    {getStatusBadge(transaction.status)}
                    {getTypeBadge(transaction.type)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
