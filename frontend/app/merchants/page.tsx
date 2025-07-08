'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as LucideIcons from 'lucide-react';
import { useEffect, useState } from 'react';

interface Merchant {
  id: string;
  businessName: string;
  merchantId: string;
  status: string;
  tier: string;
  totalRevenue: number;
  totalTransactions: number;
  createdAt: string;
  website: string;
}

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');

  useEffect(() => {
    // TODO: Fetch merchants from API
    setMerchants([
      {
        id: 'merchant_001',
        businessName: 'Tech Store Co.',
        merchantId: 'MERCH-001',
        status: 'active',
        tier: 'gold',
        totalRevenue: 2500000,
        totalTransactions: 1250,
        createdAt: '2024-01-01T00:00:00Z',
        website: 'https://techstore.com'
      },
      {
        id: 'merchant_002',
        businessName: 'Fashion Boutique',
        merchantId: 'MERCH-002',
        status: 'pending',
        tier: 'silver',
        totalRevenue: 850000,
        totalTransactions: 450,
        createdAt: '2024-01-05T00:00:00Z',
        website: 'https://fashionboutique.com'
      },
      {
        id: 'merchant_003',
        businessName: 'Restaurant Chain',
        merchantId: 'MERCH-003',
        status: 'active',
        tier: 'bronze',
        totalRevenue: 1200000,
        totalTransactions: 800,
        createdAt: '2024-01-10T00:00:00Z',
        website: 'https://restaurantchain.com'
      }
    ]);
  }, []);

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.merchantId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || merchant.status === statusFilter;
    const matchesTier = tierFilter === 'all' || merchant.tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const getStatusBadge = (status: string) => {
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
    switch (status) {
      case 'active':
        variant = 'default';
        break;
      case 'pending':
        variant = 'secondary';
        break;
      case 'suspended':
        variant = 'destructive';
        break;
      case 'inactive':
        variant = 'outline';
        break;
      default:
        variant = 'secondary';
    }
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getTierBadge = (tier: string) => {
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
    switch (tier) {
      case 'gold':
        variant = 'default';
        break;
      case 'silver':
        variant = 'secondary';
        break;
      case 'bronze':
        variant = 'outline';
        break;
      default:
        variant = 'secondary';
    }
    return <Badge variant={variant}>{tier}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Merchants</h1>
        <Button>
          <LucideIcons.Plus className="w-4 h-4 mr-2" />
          Add Merchant
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search merchants..."
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
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <Label htmlFor="tier-select">Tier</Label>
              <select
                id="tier-select"
                value={tierFilter}
                onChange={e => setTierFilter(e.target.value)}
                className="w-full border rounded px-2 py-1"
              >
                <option value="all">All tiers</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="bronze">Bronze</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Merchants List */}
      <Card>
        <CardHeader>
          <CardTitle>Merchant List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMerchants.map((merchant) => (
              <div key={merchant.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <LucideIcons.Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{merchant.businessName}</p>
                    <p className="text-sm text-muted-foreground">
                      {merchant.merchantId} • {merchant.website}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(merchant.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">฿{merchant.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {merchant.totalTransactions} transactions
                  </p>
                  <div className="flex gap-2 mt-1">
                    {getStatusBadge(merchant.status)}
                    {getTierBadge(merchant.tier)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <LucideIcons.Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <LucideIcons.Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <LucideIcons.Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
