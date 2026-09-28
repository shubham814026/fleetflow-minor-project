import React, { useState, useEffect } from 'react';
import { Fuel, TrendingUp, DollarSign, Lightbulb, AlertTriangle, ArrowUpRight, Plus } from 'lucide-react';
import { fuelApi } from '../api';

export default function FuelPage() {
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFuelData() {
      try {
        const [mData, lData] = await Promise.all([
          fuelApi.getMetrics(),
          fuelApi.getLogs()
        ]);
        setMetrics(mData);
        setLogs(Array.isArray(lData) ? lData : []);
      } catch (err) {
        console.error('Failed loading fuel metrics', err);
      } finally {
        setLoading(false);
      }
    }
    loadFuelData();
  }, []);

  if (loading || !metrics) {
    return <div className="p-8 text-center text-slate-400 text-xs animate-pulse">Loading fuel telemetry analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Fuel className="w-6 h-6 text-amber-400" /> Fuel & Cost Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">Fleet consumption, cost per km, mileage comparisons & backend insights</p>
        </div>

        <a
          href="/fuel/create"
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Log Fuel Entry
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400 block">Total Spent (This Month)</span>
          <span className="text-xl font-black text-amber-400">₹ {metrics.totalSpentThisMonth.toLocaleString()}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400 block">Total Fuel Consumed</span>
          <span className="text-xl font-black text-slate-100">{metrics.totalLitres.toLocaleString()} L</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400 block">Average Cost / km</span>
          <span className="text-xl font-black text-emerald-400">₹ {metrics.avgCostPerKm} / km</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400 block">Fleet Average Mileage</span>
          <span className="text-xl font-black text-indigo-400">{metrics.avgKmPerLitre} km/L</span>
        </div>
      </div>

      {/* Live Fuel Logs Table from Supabase */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Recent Fuel Logs (Supabase)
          </h2>
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            {logs.length} Logged Entries
          </span>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">No fuel records logged yet. Click &apos;Log Fuel Entry&apos; to submit a new entry.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2">Vehicle</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Litres</th>
                  <th className="pb-2">Cost (₹)</th>
                  <th className="pb-2">Odometer</th>
                  <th className="pb-2">Station</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="text-slate-300 hover:bg-slate-800/40">
                    <td className="py-2.5 font-bold text-amber-400">{log.vehicleReg}</td>
                    <td className="py-2.5 text-slate-400">{log.date}</td>
                    <td className="py-2.5 font-semibold">{log.litres} L</td>
                    <td className="py-2.5 text-emerald-400 font-semibold">₹ {log.cost?.toLocaleString()}</td>
                    <td className="py-2.5 text-slate-400">{log.odometer?.toLocaleString()} km</td>
                    <td className="py-2.5 text-slate-400">{log.fuelStation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Backend Insight Recommendations Section (SRS Requirement 15) */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" /> Backend Insight Recommendations
          </h2>
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Backend API Insight Stream
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(metrics.aiInsights || []).map((ins) => (
            <div
              key={ins.id}
              className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">{ins.title}</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-extrabold">
                  Savings: {ins.potentialSavings}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">{ins.description}</p>
              <div className="text-[11px] text-slate-400 pt-1">
                Target Asset: <strong className="text-slate-200">{ins.vehicle}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
