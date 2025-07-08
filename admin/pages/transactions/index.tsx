import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { api, endpoints } from '../../lib/api';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(endpoints.transactions.list)
      .then(res => setTransactions(res.data.data || []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      <div className="bg-white p-6 rounded shadow">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2">#</th>
                <th className="py-2">Type</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Currency</th>
                <th className="py-2">Status</th>
                <th className="py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={tx.id}>
                  <td className="py-2">{i + 1}</td>
                  <td className="py-2">{tx.type}</td>
                  <td className="py-2">{tx.amount}</td>
                  <td className="py-2">{tx.currency}</td>
                  <td className="py-2">{tx.status}</td>
                  <td className="py-2">{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default Transactions;
