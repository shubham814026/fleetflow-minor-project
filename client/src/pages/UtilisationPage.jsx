import React, { useState, useEffect } from 'react';
import { Activity, Truck, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { vehicleApi } from '../api';

export default function UtilisationPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const u = await vehicleApi.getUtilisation();
        setData(u);
      } catch (err) {
        console.error('Error fetching utilisation data', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-xs animate-pulse">Calculating fleet utilisation scores...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-400" /> Fleet Asset Utilisation
          </h1>
          <p className="text-xs text-slate-400 mt-1">Utilisation scores (0–100), active hours ratio & decision recommendations</p>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Utilisation Score</th>
                <th className="p-4">Active Hours / Day</th>
                <th className="p-4">Idle / Active Ratio</th>
                <th className="p-4">Trips / Day</th>
                <th className="p-4">Recommendation Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-black text-slate-100">{row.vehicleReg}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full ${
                            row.score >= 80 ? 'bg-emerald-500' : row.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${row.score}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-200">{row.score} / 100</span>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-200">{row.activeHours} hrs</td>
                  <td className="p-4 text-slate-300">{(row.idleRatio * 100).toFixed(0)}% idle</td>
                  <td className="p-4 font-bold text-slate-100">{row.tripsPerDay}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                        row.recommendation === 'Optimal'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : row.recommendation === 'Monitor'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : row.recommendation === 'Reassign'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {row.recommendation}
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
