import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';

const SettlementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [settlement, setSettlement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [failReason, setFailReason] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyResult, setNotifyResult] = useState<string | null>(null);

  const fetchSettlement = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/settlements/${id}`);
      setSettlement(res.data);
    } catch {
      setError('ไม่พบข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlement();
    // eslint-disable-next-line
  }, [id]);

  const handleExport = async () => {
    if (!id) return;
    setExporting(true);
    try {
      const res = await axios.get(`/api/settlements/${id}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `settlement-${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } finally {
      setExporting(false);
    }
  };

  const handleStatus = async (status: 'completed' | 'failed') => {
    if (!id) return;
    setStatusLoading(true);
    try {
      await axios.patch(`/api/settlements/${id}/status`, {
        status,
        failureReason: status === 'failed' ? failReason : undefined,
      });
      await fetchSettlement();
      setFailReason('');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleNotify = async () => {
    if (!id) return;
    setNotifyLoading(true);
    setNotifyResult(null);
    try {
      const res = await axios.post(`/api/settlements/${id}/notify`);
      setNotifyResult(res.data.message || 'Notification sent');
    } catch (e: any) {
      setNotifyResult(e?.response?.data?.message || 'Failed to send notification');
    } finally {
      setNotifyLoading(false);
    }
  };

  if (loading) return <AdminLayout><div>Loading...</div></AdminLayout>;
  if (error || !settlement) return <AdminLayout><div>{error || 'ไม่พบข้อมูล'}</div></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4 flex items-center justify-between">
        Settlement Detail
        <div className="flex gap-2 items-center">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
            onClick={handleNotify}
            disabled={notifyLoading}
          >
            {notifyLoading ? 'Sending...' : 'Send Email Notification'}
          </button>
        </div>
      </h1>
      {notifyResult && (
        <div className={`mb-4 ${notifyResult.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>{notifyResult}</div>
      )}
      <div className="bg-white p-6 rounded shadow max-w-xl mb-8">
        <div className="mb-2"><b>Settlement ID:</b> {settlement.settlementId || settlement.id}</div>
        <div className="mb-2"><b>Merchant:</b> {settlement.merchant?.merchantId || '-'}</div>
        <div className="mb-2"><b>Type:</b> {settlement.type}</div>
        <div className="mb-2"><b>Status:</b> <span className={settlement.status === 'completed' ? 'text-green-600' : settlement.status === 'failed' ? 'text-red-600' : 'text-gray-700'}>{settlement.status}</span></div>
        <div className="mb-2"><b>Net Amount (THB):</b> ฿{settlement.netAmount?.toLocaleString()}</div>
        <div className="mb-2"><b>Transaction Count:</b> {settlement.transactionCount}</div>
        <div className="mb-2"><b>Created:</b> {settlement.createdAt ? new Date(settlement.createdAt).toLocaleString() : '-'}</div>
        <div className="mb-2"><b>Completed:</b> {settlement.completedAt ? new Date(settlement.completedAt).toLocaleString() : '-'}</div>
        <div className="mb-2"><b>Failure Reason:</b> {settlement.failureReason || '-'}</div>
        <div className="flex space-x-2 mt-4">
          {settlement.status !== 'completed' && (
            <button
              onClick={() => handleStatus('completed')}
              disabled={statusLoading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {statusLoading ? 'Updating...' : 'Mark as Completed'}
            </button>
          )}
          {settlement.status !== 'failed' && (
            <>
              <input
                type="text"
                placeholder="Failure reason"
                className="border rounded px-2 py-1 text-sm"
                value={failReason}
                onChange={e => setFailReason(e.target.value)}
                style={{ minWidth: 120 }}
              />
              <button
                onClick={() => handleStatus('failed')}
                disabled={statusLoading || !failReason}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                {statusLoading ? 'Updating...' : 'Mark as Failed'}
              </button>
            </>
          )}
          <button onClick={() => navigate(-1)} className="ml-auto text-gray-600 hover:underline">Back</button>
        </div>
      </div>
      <div className="bg-white p-6 rounded shadow max-w-xl mb-8">
        <div className="text-lg font-semibold mb-2">Transactions in Settlement</div>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 border">Transaction ID</th>
                <th className="px-3 py-2 border">Amount</th>
                <th className="px-3 py-2 border">Status</th>
                <th className="px-3 py-2 border">Created</th>
              </tr>
            </thead>
            <tbody>
              {settlement.transactions && settlement.transactions.length > 0 ? (
                settlement.transactions.map((tx: any) => (
                  <tr key={tx.id}>
                    <td className="px-3 py-2 border">{tx.transactionId || tx.id}</td>
                    <td className="px-3 py-2 border text-right">฿{tx.amount?.toLocaleString()}</td>
                    <td className="px-3 py-2 border text-center">
                      <span className={tx.status === 'completed' ? 'text-green-600' : tx.status === 'failed' ? 'text-red-600' : 'text-gray-700'}>{tx.status}</span>
                    </td>
                    <td className="px-3 py-2 border">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'}</td>
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

export default SettlementDetail;
