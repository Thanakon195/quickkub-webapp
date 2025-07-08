import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, CardHeader, Table } from 'react-bootstrap';
import { FaCheck, FaExclamationTriangle, FaEye, FaFilter, FaSearch, FaTimes } from 'react-icons/fa';

interface Transaction {
  id: string;
  transactionId: string;
  merchantName: string;
  customerName: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  paymentMethod: string;
  createdAt: string;
  riskScore: number;
}

const TransactionMonitoring: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [showFraudAlerts, setShowFraudAlerts] = useState(true);

  useEffect(() => {
    // TODO: Fetch transactions from API
    setTransactions([
      {
        id: '1',
        transactionId: 'TXN-2024-001',
        merchantName: 'Tech Store Co.',
        customerName: 'John Doe',
        amount: 2500,
        currency: 'THB',
        status: 'completed',
        type: 'payment',
        paymentMethod: 'credit_card',
        createdAt: '2024-01-15T10:30:00Z',
        riskScore: 15
      },
      {
        id: '2',
        transactionId: 'TXN-2024-002',
        merchantName: 'Fashion Boutique',
        customerName: 'Jane Smith',
        amount: 1500,
        currency: 'THB',
        status: 'pending',
        type: 'payment',
        paymentMethod: 'promptpay',
        createdAt: '2024-01-15T09:15:00Z',
        riskScore: 85
      },
      {
        id: '3',
        transactionId: 'TXN-2024-003',
        merchantName: 'Restaurant Chain',
        customerName: 'Bob Wilson',
        amount: 500,
        currency: 'THB',
        status: 'failed',
        type: 'payment',
        paymentMethod: 'bank_transfer',
        createdAt: '2024-01-15T08:00:00Z',
        riskScore: 95
      }
    ]);
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesRisk = riskFilter === 'all' ||
                       (riskFilter === 'high' && transaction.riskScore > 70) ||
                       (riskFilter === 'medium' && transaction.riskScore > 30 && transaction.riskScore <= 70) ||
                       (riskFilter === 'low' && transaction.riskScore <= 30);
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: 'success',
      pending: 'warning',
      failed: 'danger',
      cancelled: 'secondary',
      refunded: 'info'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore > 70) {
      return <Badge bg="danger">High Risk ({riskScore})</Badge>;
    } else if (riskScore > 30) {
      return <Badge bg="warning">Medium Risk ({riskScore})</Badge>;
    } else {
      return <Badge bg="success">Low Risk ({riskScore})</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      payment: 'primary',
      refund: 'info',
      withdrawal: 'secondary',
      deposit: 'success'
    };
    return <Badge bg={variants[type] || 'secondary'}>{type}</Badge>;
  };

  const highRiskTransactions = transactions.filter(t => t.riskScore > 70);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Transaction Monitoring</h1>
        <div className="d-flex gap-2">
          <Button variant="outline-warning">
            <FaExclamationTriangle className="me-2" />
            Fraud Alerts ({highRiskTransactions.length})
          </Button>
          <Button variant="primary">
            <FaFilter className="me-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Fraud Alerts */}
      {showFraudAlerts && highRiskTransactions.length > 0 && (
        <Alert variant="danger" dismissible onClose={() => setShowFraudAlerts(false)}>
          <Alert.Heading>
            <FaExclamationTriangle className="me-2" />
            High Risk Transactions Detected
          </Alert.Heading>
          <p>
            {highRiskTransactions.length} transactions have been flagged as high risk.
            Please review these transactions immediately.
          </p>
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <div className="row">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>
            <div className="col-md-2">
              <Button variant="outline-secondary" className="w-100">
                Export
              </Button>
            </div>
            <div className="col-md-2">
              <Button variant="outline-primary" className="w-100">
                Real-time
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <h6 className="m-0 font-weight-bold text-primary">Transaction List</h6>
        </CardHeader>
        <Card.Body>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Merchant</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Type</th>
                <th>Risk Score</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <strong>{transaction.transactionId}</strong>
                    <br />
                    <small className="text-muted">{transaction.paymentMethod}</small>
                  </td>
                  <td>{transaction.merchantName}</td>
                  <td>{transaction.customerName}</td>
                  <td>
                    <strong>฿{transaction.amount.toLocaleString()}</strong>
                    <br />
                    <small className="text-muted">{transaction.currency}</small>
                  </td>
                  <td>{getStatusBadge(transaction.status)}</td>
                  <td>{getTypeBadge(transaction.type)}</td>
                  <td>{getRiskBadge(transaction.riskScore)}</td>
                  <td>
                    {new Date(transaction.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        title="View Details"
                      >
                        <FaEye />
                      </Button>
                      {transaction.status === 'pending' && (
                        <>
                          <Button
                            variant="outline-success"
                            size="sm"
                            title="Approve"
                          >
                            <FaCheck />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            title="Reject"
                          >
                            <FaTimes />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TransactionMonitoring;
