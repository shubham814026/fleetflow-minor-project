import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Calendar, AlertCircle } from 'lucide-react';
import { forecastApi } from '../api';

export default function ForecastPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const fc = await forecastApi.getDemand();
        setData(fc);
      } catch (err) {
        console.error('Failed loading forecast', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-400 text-xs animate-pulse">Computing demand forecasting telemetry...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-amber-400" /> Fleet Demand & Load Forecasting
        </h1>
        <p className="text-xs text-slate-400 mt-1">Backend AI predictive demand feeds & regional load projections</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">Predicted Next Week Trips</span>
          <span className="text-2xl font-black text-amber-400">{data.nextWeekDemandTrips} Trips</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">Expected Peak Demand Day</span>
          <span className="text-2xl font-black text-slate-100">{data.peakDay}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">Predicted Vehicle Deficit</span>
          <span className="text-2xl font-black text-rose-400">{data.predictedVehicleDeficit} Units Short</span>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Demand Projections By Logistics Region</h3>
        <div className="space-y-3">
          {data.demandByRegion.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs">
              <span className="font-bold text-slate-200">{r.region}</span>
              <span className="font-mono text-slate-300">{r.trips} Trips</span>
              <span className="font-bold text-emerald-400">{r.trend} Growth</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
