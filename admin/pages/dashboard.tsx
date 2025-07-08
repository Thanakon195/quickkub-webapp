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
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import AdminLayout from '../layouts/AdminLayout';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const [settlementMetrics, setSettlementMetrics] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [trendData, setTrendData] = useState<any[]>([]);

  const fetchMetrics = async (fromDate?: string | undefined, toDate?: string | undefined) => {
    let url = '/api/metrics/settlement-metrics';
    const params: string[] = [];
    if (fromDate) params.push(`from=${fromDate}`);
    if (toDate) params.push(`to=${toDate}`);
    if (params.length) url += '?' + params.join('&');
    const res = await axios.get(url);
    setSettlementMetrics(res.data);
  };

  const fetchTrend = async (fromDate?: string | undefined, toDate?: string | undefined) => {
    let url = '/api/settlements/trend';
    const params: string[] = [];
    if (fromDate) params.push(`from=${fromDate}`);
    if (toDate) params.push(`to=${toDate}`);
    if (params.length) url += '?' + params.join('&');
    try {
      const res = await axios.get(url);
      setTrendData(res.data);
    } catch {
      setTrendData([]);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchTrend();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      let url = '/api/metrics/export-settlement-metrics';
      const params: string[] = [];
      if (from) params.push(`from=${from}`);
      if (to) params.push(`to=${to}`);
      if (params.length) url += '?' + params.join('&');
      const res = await axios.get(url, {
        responseType: 'blob',
      });
      const urlBlob = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', 'settlement-metrics.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } finally {
      setExporting(false);
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMetrics(from, to);
    fetchTrend(from, to);
  };

  // เตรียมข้อมูลสำหรับกราฟ
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

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4 flex items-center justify-between">
        Dashboard
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm ml-4"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Export Settlement Metrics (CSV)'}
        </button>
      </h1>
      <form className="mb-4 flex gap-2 items-center" onSubmit={handleFilter}>
        <label className="text-sm">From:
          <input type="date" className="ml-1 border rounded px-2 py-1" value={from} onChange={e => setFrom(e.target.value)} />
        </label>
        <label className="text-sm">To:
          <input type="date" className="ml-1 border rounded px-2 py-1" value={to} onChange={e => setTo(e.target.value)} />
        </label>
        <button type="submit" className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded text-sm">Filter</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <div className="text-gray-500">Total Merchants</div>
          <div className="text-3xl font-bold">123</div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <div className="text-gray-500">Total Settlements</div>
          <div className="text-3xl font-bold">{settlementMetrics ? settlementMetrics.totalSettlements : '-'}</div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <div className="text-gray-500">Settlement Net Amount (THB)</div>
          <div className="text-3xl font-bold">฿{settlementMetrics ? settlementMetrics.totalNetAmount.toLocaleString() : '-'}</div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <div className="text-gray-500">Settlement Success Rate</div>
          <div className="text-3xl font-bold">{settlementMetrics ? settlementMetrics.completedRate.toFixed(2) + '%' : '-'}</div>
        </div>
      </div>
      <div className="bg-white p-6 rounded shadow mb-8">
        <div className="text-lg font-semibold mb-2">Settlement Metrics by Merchant</div>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 border">Merchant ID</th>
                <th className="px-3 py-2 border">Settlement Count</th>
                <th className="px-3 py-2 border">Net Amount (THB)</th>
              </tr>
            </thead>
            <tbody>
              {settlementMetrics && settlementMetrics.byMerchant && settlementMetrics.byMerchant.length > 0 ? (
                settlementMetrics.byMerchant.map((row: any) => (
                  <tr key={row.merchantId}>
                    <td className="px-3 py-2 border">
                      <Link href={`/merchants/${row.merchantId}`} className="text-blue-600 hover:underline">{row.merchantId}</Link>
                    </td>
                    <td className="px-3 py-2 border text-right">{row.count}</td>
                    <td className="px-3 py-2 border text-right">฿{row.amount.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-2 border text-center" colSpan={3}>No data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <div className="text-lg font-semibold mb-2">Settlement Trend</div>
        <div className="overflow-x-auto">
          <Line data={chartData} options={chartOptions} height={320} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
