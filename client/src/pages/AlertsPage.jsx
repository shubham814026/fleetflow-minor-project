import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, CheckCircle, Eye, Filter } from 'lucide-react';
import { alertApi } from '../api';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await alertApi.getAll();
        setAlerts(data);
      } catch (err) {
        console.error('Failed loading alerts', err);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await alertApi.updateStatus(id, status);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      console.error('Failed updating alert status', err);
    }
  };

  const filtered = alerts.filter(
    (a) => categoryFilter === 'ALL' || a.category.toLowerCase() === categoryFilter.toLowerCase()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" /> Fleet Alerts & Incident Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">Unified monitoring for SOS emergency, fraud, geofence & maintenance alerts</p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <Filter className="w-4 h-4 text-amber-400" />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="SOS">SOS Emergency</option>
          <option value="Fraud">Fraud & Fuel Siphoning</option>
          <option value="Geofence">Geofence Violations</option>
          <option value="Maintenance">Maintenance Due</option>
          <option value="Document Expiry">Document Expiry</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((alt) => (
          <div
            key={alt.id}
            className={`bg-slate-900/90 border rounded-2xl p-5 shadow-xl space-y-3 transition-colors ${
              alt.severity === 'Critical'
                ? 'border-rose-500/40 bg-rose-950/10'
                : alt.severity === 'High'
                ? 'border-amber-500/40 bg-amber-950/10'
                : 'border-slate-800'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                    alt.category === 'SOS'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : alt.category === 'Fraud'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-purple-600 text-white'
                  }`}
                >
                  {alt.category}
                </span>
                {alt.isLiveModel && (
                  <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-[9px] font-bold">
                    AI ISOLATION FOREST
                  </span>
                )}
                {alt.fraudRiskScore && (
                  <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-[9px] font-extrabold font-mono">
                    RISK: {alt.fraudRiskScore}/100
                  </span>
                )}
                <span className="text-xs font-bold text-slate-100">
                  Vehicle: {alt.vehicleReg} • Driver: {alt.driverName}
                </span>
              </div>

              <span className="text-[11px] text-slate-400">
                {new Date(alt.timestamp).toLocaleString()}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium">{alt.description}</p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                  alt.status === 'Open'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : alt.status === 'Reviewed'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                Status: {alt.status}
              </span>

              <div className="flex items-center gap-2">
                {alt.status !== 'Reviewed' && (
                  <button
                    onClick={() => handleUpdateStatus(alt.id, 'Reviewed')}
                    className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-bold transition-all"
                  >
                    Mark Reviewed
                  </button>
                )}
                {alt.status !== 'Resolved' && (
                  <button
                    onClick={() => handleUpdateStatus(alt.id, 'Resolved')}
                    className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold transition-all"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
