import React, { useState, useEffect } from 'react';
import { Shield, Award, AlertTriangle, Zap, Gauge } from 'lucide-react';
import { driverApi } from '../api';

export default function SafetyPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await driverApi.getSafetyMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Error loading safety metrics', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !metrics) {
    return <div className="p-8 text-center text-slate-400 text-xs animate-pulse">Calculating safety telemetry scores...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" /> Driver Safety & Behavior Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">Telemetry scoring, harsh braking, acceleration & driver safety leaderboard</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400 block">Fleet Overall Safety Score</span>
          <span className="text-2xl font-black text-emerald-400">{metrics.overallSafetyScore} / 100</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400 block">Speeding Events (This Month)</span>
          <span className="text-2xl font-black text-amber-400">{metrics.totalSpeedingEvents}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400 block">Harsh Braking Events</span>
          <span className="text-2xl font-black text-rose-400">{metrics.harshBrakingEvents}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400 block">Harsh Acceleration Events</span>
          <span className="text-2xl font-black text-indigo-400">{metrics.harshAccelerationEvents}</span>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" /> Driver Safety Score Leaderboard
        </h2>

        <div className="space-y-3">
          {metrics.leaderboard.map((drv, rank) => (
            <div key={drv.id} className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 font-bold text-slate-300 flex items-center justify-center text-[10px]">
                  #{rank + 1}
                </span>
                <div>
                  <span className="font-bold text-slate-100 block">{drv.name}</span>
                  <span className="text-[10px] text-slate-400">{drv.assignedVehicleReg}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-black text-emerald-400 text-sm">{drv.safetyScore} pts</span>
                <span className="text-[10px] text-slate-500 block">{drv.totalTrips} Trips Completed</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
