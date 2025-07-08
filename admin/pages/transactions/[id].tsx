import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { api, endpoints } from '../../lib/api';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  createdAt: string;
}

const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.get(endpoints.transactions.detail(id))
      .then(res => setTx(res.data.data))
      .catch(() => setError('ไม่พบข้อมูล'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <AdminLayout><div>Loading...</div></AdminLayout>;
  if (error || !tx) return <AdminLayout><div>{error || 'ไม่พบข้อมูล'}</div></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Transaction Detail</h1>
      <div className="bg-white p-6 rounded shadow max-w-xl">
        <div className="mb-2"><b>ID:</b> {tx.id}</div>
        <div className="mb-2"><b>Type:</b> {tx.type}</div>
        <div className="mb-2"><b>Amount:</b> {tx.amount} {tx.currency}</div>
        <div className="mb-2"><b>Status:</b> <span className={tx.status === 'completed' ? 'text-green-600' : 'text-red-600'}>{tx.status}</span></div>
        {tx.description && <div className="mb-2"><b>Description:</b> {tx.description}</div>}
        <div className="mb-2"><b>Created:</b> {new Date(tx.createdAt).toLocaleString()}</div>
        <div className="flex mt-4">
          <button onClick={() => navigate(-1)} className="ml-auto text-gray-600 hover:underline">Back</button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TransactionDetail;
