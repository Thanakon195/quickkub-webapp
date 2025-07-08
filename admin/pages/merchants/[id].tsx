import axios from 'axios';
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { api, endpoints } from '../../lib/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Merchant {
  id: string;
  name: string;
  email: string;
  tier: string;
  status: string;
  kycStatus: string;
  createdAt: string;
}

const MerchantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [settlementSummary, setSettlementSummary] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    api.get(endpoints.merchants.detail(id))
      .then(res => setMerchant(res.data.data))
      .catch(() => setError('ไม่พบข้อมูล'))
      .finally(() => setLoading(false));
    // Settlement summary
    axios.get(`/api/settlements/summary/${id}`)
      .then(res => setSettlementSummary(res.data))
      .catch(() => setSettlementSummary(null));
    // Trend
    axios.get(`/api/settlements/trend?merchantId=${id}`)
      .then(res => setTrendData(res.data))
      .catch(() => setTrendData([]));
    // Settlements list
    axios.get(`/api/settlements/merchant/${id}?limit=10`)
      .then(res => setSettlements(res.data))
      .catch(() => setSettlements([]));
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await api.post(endpoints.merchants.approve(id));
      setMerchant(m => m ? { ...m, status: 'active' } : m);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await api.post(endpoints.merchants.suspend(id));
      setMerchant(m => m ? { ...m, status: 'suspended' } : m);
    } finally {
      setActionLoading(false);
    }
  };

  // Chart data
  const chartData = {
    labels: trendData.map((d: any) => d.date),
    datasets: [
      {
        label: 'Net Amount (THB)',
        data: trendData.map((d: any) => d.netAmount),
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,0.1)',
        yAxisID: 'y',
      },
      {
        label: 'Settlement Count',
        data: trendData.map((d: any) => d.count),
        borderColor: 'rgba(16,185,129,1)',
        backgroundColor: 'rgba(16,185,129,0.1)',
        yAxisID: 'y1',
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Settlement Trend' },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Net Amount (THB)' },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Settlement Count' },
      },
    },
  };

  if (loading) return <AdminLayout><div>Loading...</div></AdminLayout>;
  if (error || !merchant) return <AdminLayout><div>{error || 'ไม่พบข้อมูล'}</div></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Merchant Detail</h1>
      <div className="bg-white p-6 rounded shadow max-w-xl mb-8">
        <div className="mb-2"><b>Name:</b> {merchant.name}</div>
        <div className="mb-2"><b>Email:</b> {merchant.email}</div>
        <div className="mb-2"><b>Tier:</b> {merchant.tier}</div>
        <div className="mb-2"><b>Status:</b> <span className={merchant.status === 'active' ? 'text-green-600' : 'text-red-600'}>{merchant.status}</span></div>
        <div className="mb-2"><b>KYC Status:</b> {merchant.kycStatus}</div>
        <div className="mb-2"><b>Created:</b> {new Date(merchant.createdAt).toLocaleString()}</div>
        <div className="flex space-x-2 mt-4">
          {merchant.status !== 'active' && (
            <button onClick={handleApprove} disabled={actionLoading} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Approve</button>
          )}
          {merchant.status === 'active' && (
            <button onClick={handleSuspend} disabled={actionLoading} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Suspend</button>
          )}
          <button onClick={() => navigate(-1)} className="ml-auto text-gray-600 hover:underline">Back</button>
        </div>
      </div>
      <div className="bg-white p-6 rounded shadow max-w-xl mb-8">
        <div className="text-lg font-semibold mb-2">Settlement Summary</div>
        {settlementSummary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-gray-500">Total Settlements</div>
              <div className="text-xl font-bold">{settlementSummary.totalTransactions || settlementSummary.totalSettlements || '-'}</div>
            </div>
            <div>
              <div className="text-gray-500">Net Amount (THB)</div>
              <div className="text-xl font-bold">3f{settlementSummary.netAmount ? settlementSummary.netAmount.toLocaleString() : (settlementSummary.totalNetAmount ? settlementSummary.totalNetAmount.toLocaleString() : '-')}</div>
            </div>
            <div>
              <div className="text-gray-500">Success Rate</div>
              <div className="text-xl font-bold">{settlementSummary.completedRate ? settlementSummary.completedRate.toFixed(2) + '%' : '-'}</div>
            </div>
          </div>
        ) : (
          <div>No settlement data</div>
        )}
        <div className="mt-4">
          <div className="text-md font-semibold mb-2">Settlement Trend</div>
          <Line data={chartData} options={chartOptions} height={220} />
        </div>
      </div>
      <div className="bg-white p-6 rounded shadow max-w-xl mb-8">
        <div className="text-lg font-semibold mb-2">Recent Settlements</div>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 border">Settlement ID</th>
                <th className="px-3 py-2 border">Date</th>
                <th className="px-3 py-2 border">Net Amount (THB)</th>
                <th className="px-3 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {settlements && settlements.length > 0 ? (
                settlements.map((s: any) => (
                  <tr key={s.id}>
                    <td className="px-3 py-2 border">
                      <Link to={`/settlements/${s.id}`} className="text-blue-600 hover:underline">{s.settlementId || s.id}</Link>
                    </td>
                    <td className="px-3 py-2 border">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2 border text-right">3f{s.netAmount ? s.netAmount.toLocaleString() : '-'}</td>
                    <td className="px-3 py-2 border text-center">
                      <span className={s.status === 'completed' ? 'text-green-600' : s.status === 'failed' ? 'text-red-600' : 'text-gray-700'}>{s.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-2 border text-center" colSpan={4}>No data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MerchantDetail;
