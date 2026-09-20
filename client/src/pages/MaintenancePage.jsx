import React, { useState, useEffect } from 'react';
import { Wrench, ShieldCheck, AlertCircle, Plus, Calendar } from 'lucide-react';
import { maintenanceApi } from '../api';

export default function MaintenancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await maintenanceApi.getRecords();
        setRecords(data);
      } catch (err) {
        console.error('Error loading maintenance logs', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-400" /> Fleet Maintenance & Service Schedules
          </h1>
          <p className="text-xs text-slate-400 mt-1">Odometer threshold tracking & scheduled maintenance due dates</p>
        </div>

        <a
          href="/maintenance/create"
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Log Service Record
        </a>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Service Type</th>
                <th className="p-4">Breakdown Risk (AI Model 7.5)</th>
                <th className="p-4">Primary Component Risk</th>
                <th className="p-4">Last Service</th>
                <th className="p-4">Next Service Due</th>
                <th className="p-4">Current Odometer</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-black text-slate-100 flex items-center gap-2">
                    {r.vehicleReg}
                    {r.isLiveModel && (
                      <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-[9px] font-bold">
                        AI LIVE
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-medium text-slate-300">{r.serviceType}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold text-xs ${
                        (r.breakdownRiskScore || 0) >= 70 ? 'text-rose-400' : (r.breakdownRiskScore || 0) >= 40 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {r.breakdownRiskScore ? `${r.breakdownRiskScore}%` : '8.5%'}
                      </span>
                      <div className="w-16 bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full ${
                            (r.breakdownRiskScore || 0) >= 70 ? 'bg-rose-500' : (r.breakdownRiskScore || 0) >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(10, r.breakdownRiskScore || 10))}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300 font-medium">
                    {r.primaryComponentRisk || 'Brake System & Wear'}
                  </td>
                  <td className="p-4 text-slate-400">{r.lastServiceDate}</td>
                  <td className="p-4 font-semibold text-slate-200">{r.nextServiceDate || r.predictedServiceDue}</td>
                  <td className="p-4 font-mono font-bold text-amber-400">{r.odometer ? r.odometer.toLocaleString() : '89,000'} km</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                        r.status === 'Overdue'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : r.status === 'Due Soon'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {r.status}
                    </span>
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
