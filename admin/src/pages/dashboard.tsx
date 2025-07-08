import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from 'react-bootstrap';
import {
    FaArrowDown,
    FaArrowUp,
    FaChartLine,
    FaCreditCard,
    FaExclamationTriangle,
    FaUsers
} from 'react-icons/fa';

interface DashboardStats {
  totalMerchants: number;
  totalTransactions: number;
  totalRevenue: number;
  activePayments: number;
  pendingSettlements: number;
  systemHealth: string;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: string;
  }>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMerchants: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    activePayments: 0,
    pendingSettlements: 0,
    systemHealth: 'healthy',
    recentActivity: []
  });

  useEffect(() => {
    // TODO: Fetch dashboard data from API
    setStats({
      totalMerchants: 1250,
      totalTransactions: 45000,
      totalRevenue: 125000000,
      activePayments: 45,
      pendingSettlements: 12,
      systemHealth: 'healthy',
      recentActivity: [
        {
          id: '1',
          type: 'payment',
          description: 'New payment received from Tech Store Co.',
          timestamp: '2024-01-15T10:30:00Z',
          status: 'completed'
        },
        {
          id: '2',
          type: 'merchant',
          description: 'New merchant registration: Fashion Boutique',
          timestamp: '2024-01-15T09:15:00Z',
          status: 'pending'
        },
        {
          id: '3',
          type: 'settlement',
          description: 'Settlement processed for Restaurant Chain',
          timestamp: '2024-01-15T08:00:00Z',
          status: 'completed'
        }
      ]
    });
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: 'success',
      pending: 'warning',
      failed: 'danger'
    };
    return <span className={`badge bg-${variants[status] || 'secondary'}`}>{status}</span>;
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      payment: FaCreditCard,
      merchant: FaUsers,
      settlement: FaChartLine
    };
    const Icon = icons[type] || FaExclamationTriangle;
    return <Icon className="me-2" />;
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Admin Dashboard</h1>
        <div className="d-flex gap-2">
          <button className="btn btn-primary">
            <FaArrowUp className="me-2" />
            Generate Report
          </button>
          <button className="btn btn-outline-secondary">
            <FaArrowDown className="me-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <Card className="border-left-primary shadow h-100 py-2">
            <Card.Body>
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Merchants
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totalMerchants.toLocaleString()}
                  </div>
                </div>
                <div className="col-auto">
                  <FaUsers className="fa-2x text-gray-300" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <Card className="border-left-success shadow h-100 py-2">
            <Card.Body>
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Transactions
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totalTransactions.toLocaleString()}
                  </div>
                </div>
                <div className="col-auto">
                  <FaCreditCard className="fa-2x text-gray-300" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <Card className="border-left-info shadow h-100 py-2">
            <Card.Body>
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Total Revenue
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    ฿{stats.totalRevenue.toLocaleString()}
                  </div>
                </div>
                <div className="col-auto">
                  <FaChartLine className="fa-2x text-gray-300" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <Card className="border-left-warning shadow h-100 py-2">
            <Card.Body>
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Active Payments
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.activePayments}
                  </div>
                </div>
                <div className="col-auto">
                  <FaExclamationTriangle className="fa-2x text-gray-300" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* System Health & Recent Activity */}
      <div className="row">
        <div className="col-lg-6 mb-4">
          <Card className="shadow">
            <CardHeader className="py-3">
              <h6 className="m-0 font-weight-bold text-primary">System Health</h6>
            </CardHeader>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className={`badge bg-${stats.systemHealth === 'healthy' ? 'success' : 'danger'} me-3`}>
                  {stats.systemHealth}
                </div>
                <span>All systems operational</span>
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  Last updated: {new Date().toLocaleString()}
                </small>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-lg-6 mb-4">
          <Card className="shadow">
            <CardHeader className="py-3">
              <h6 className="m-0 font-weight-bold text-primary">Recent Activity</h6>
            </CardHeader>
            <Card.Body>
              <div className="list-group list-group-flush">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      {getActivityIcon(activity.type)}
                      <span className="small">{activity.description}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      {getStatusBadge(activity.status)}
                      <small className="text-muted ms-2">
                        {new Date(activity.timestamp).toLocaleString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
