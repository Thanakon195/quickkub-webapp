import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, CardHeader, Modal, Table } from 'react-bootstrap';
import { FaCheck, FaEdit, FaEye, FaSearch, FaTimes } from 'react-icons/fa';

interface Merchant {
  id: string;
  businessName: string;
  merchantId: string;
  email: string;
  status: string;
  tier: string;
  kycStatus: string;
  totalRevenue: number;
  totalTransactions: number;
  createdAt: string;
  website: string;
}

const MerchantManagement: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  useEffect(() => {
    // TODO: Fetch merchants from API
    setMerchants([
      {
        id: '1',
        businessName: 'Tech Store Co.',
        merchantId: 'MERCH-001',
        email: 'admin@techstore.com',
        status: 'active',
        tier: 'gold',
        kycStatus: 'approved',
        totalRevenue: 2500000,
        totalTransactions: 1250,
        createdAt: '2024-01-01T00:00:00Z',
        website: 'https://techstore.com'
      },
      {
        id: '2',
        businessName: 'Fashion Boutique',
        merchantId: 'MERCH-002',
        email: 'admin@fashionboutique.com',
        status: 'pending',
        tier: 'silver',
        kycStatus: 'pending',
        totalRevenue: 850000,
        totalTransactions: 450,
        createdAt: '2024-01-05T00:00:00Z',
        website: 'https://fashionboutique.com'
      },
      {
        id: '3',
        businessName: 'Restaurant Chain',
        merchantId: 'MERCH-003',
        email: 'admin@restaurantchain.com',
        status: 'active',
        tier: 'bronze',
        kycStatus: 'approved',
        totalRevenue: 1200000,
        totalTransactions: 800,
        createdAt: '2024-01-10T00:00:00Z',
        website: 'https://restaurantchain.com'
      }
    ]);
  }, []);

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.merchantId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || merchant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'success',
      pending: 'warning',
      suspended: 'danger',
      inactive: 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getTierBadge = (tier: string) => {
    const variants: Record<string, string> = {
      gold: 'warning',
      silver: 'secondary',
      bronze: 'dark'
    };
    return <Badge bg={variants[tier] || 'secondary'}>{tier}</Badge>;
  };

  const getKYCBadge = (kycStatus: string) => {
    const variants: Record<string, string> = {
      approved: 'success',
      pending: 'warning',
      rejected: 'danger'
    };
    return <Badge bg={variants[kycStatus] || 'secondary'}>{kycStatus}</Badge>;
  };

  const handleViewMerchant = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setShowModal(true);
  };

  const handleApproveMerchant = (merchantId: string) => {
    // TODO: Implement approve merchant logic
    console.log('Approving merchant:', merchantId);
  };

  const handleSuspendMerchant = (merchantId: string) => {
    // TODO: Implement suspend merchant logic
    console.log('Suspending merchant:', merchantId);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Merchant Management</h1>
        <Button variant="primary">
          <FaEdit className="me-2" />
          Add New Merchant
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <div className="row">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search merchants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-3">
              <Button variant="outline-secondary" className="w-100">
                Export Data
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Merchants Table */}
      <Card>
        <CardHeader>
          <h6 className="m-0 font-weight-bold text-primary">Merchant List</h6>
        </CardHeader>
        <Card.Body>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Merchant ID</th>
                <th>Email</th>
                <th>Status</th>
                <th>Tier</th>
                <th>KYC Status</th>
                <th>Revenue</th>
                <th>Transactions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMerchants.map((merchant) => (
                <tr key={merchant.id}>
                  <td>
                    <div>
                      <strong>{merchant.businessName}</strong>
                      <br />
                      <small className="text-muted">{merchant.website}</small>
                    </div>
                  </td>
                  <td>{merchant.merchantId}</td>
                  <td>{merchant.email}</td>
                  <td>{getStatusBadge(merchant.status)}</td>
                  <td>{getTierBadge(merchant.tier)}</td>
                  <td>{getKYCBadge(merchant.kycStatus)}</td>
                  <td>฿{merchant.totalRevenue.toLocaleString()}</td>
                  <td>{merchant.totalTransactions.toLocaleString()}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewMerchant(merchant)}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleApproveMerchant(merchant.id)}
                        disabled={merchant.status === 'active'}
                      >
                        <FaCheck />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleSuspendMerchant(merchant.id)}
                        disabled={merchant.status === 'suspended'}
                      >
                        <FaTimes />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Merchant Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Merchant Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMerchant && (
            <div className="row">
              <div className="col-md-6">
                <h6>Business Information</h6>
                <p><strong>Name:</strong> {selectedMerchant.businessName}</p>
                <p><strong>Merchant ID:</strong> {selectedMerchant.merchantId}</p>
                <p><strong>Website:</strong> {selectedMerchant.website}</p>
                <p><strong>Email:</strong> {selectedMerchant.email}</p>
              </div>
              <div className="col-md-6">
                <h6>Status & Performance</h6>
                <p><strong>Status:</strong> {getStatusBadge(selectedMerchant.status)}</p>
                <p><strong>Tier:</strong> {getTierBadge(selectedMerchant.tier)}</p>
                <p><strong>KYC Status:</strong> {getKYCBadge(selectedMerchant.kycStatus)}</p>
                <p><strong>Total Revenue:</strong> ฿{selectedMerchant.totalRevenue.toLocaleString()}</p>
                <p><strong>Total Transactions:</strong> {selectedMerchant.totalTransactions.toLocaleString()}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary">
            Edit Merchant
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MerchantManagement;
