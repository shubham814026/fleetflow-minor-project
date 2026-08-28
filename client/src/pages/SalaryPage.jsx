import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { salaryApi } from '../api';

export default function SalaryPage() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await salaryApi.getAll();
        setSalaries(data);
      } catch (err) {
        console.error('Failed loading salary records', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleUpdate = async (id, status) => {
    try {
      const res = await salaryApi.updateStatus(id, status);
      setSalaries((prev) => prev.map((s) => (s.id === id ? { ...s, status, txnId: res.txnId } : s)));
    } catch (err) {
      console.error('Error updating salary status', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-amber-400" /> Driver Payroll & Salary Module
          </h1>
          <p className="text-xs text-slate-400 mt-1">HR & Accountant portal for driver monthly salary disbursement</p>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Driver Name</th>
                <th className="p-4">Month</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {salaries.map((sal) => (
                <tr key={sal.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-slate-100">{sal.driverName}</td>
                  <td className="p-4 text-slate-300">{sal.month}</td>
                  <td className="p-4 font-mono font-bold text-amber-400">₹ {sal.amount.toLocaleString()}</td>
                  <td className="p-4 text-slate-400">{sal.due}</td>
                  <td className="p-4 font-mono text-slate-300">{sal.txnId}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                        sal.status === 'Credited'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : sal.status === 'Pending'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {sal.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {sal.status !== 'Credited' && (
                      <button
                        onClick={() => handleUpdate(sal.id, 'Credited')}
                        className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold transition-all"
                      >
                        Process Credit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
