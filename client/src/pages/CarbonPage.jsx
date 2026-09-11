import React, { useState, useEffect } from 'react';
import { Leaf, TrendingDown, Truck, Activity, RefreshCw, Award, FileSpreadsheet } from 'lucide-react';
import { carbonApi } from '../api';

export default function CarbonPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const res = await carbonApi.getMetrics();
      setData(res);
    } catch (err) {
      console.error('Error fetching carbon metrics', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs animate-pulse flex flex-col items-center gap-2">
        <Activity className="w-6 h-6 text-emerald-400 animate-spin" />
        <span>Calculating fleet ESG carbon intensity & fuel emissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-400" /> Carbon Footprint & ESG Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ESG sustainability tracking, total CO₂ emissions & vehicle-level carbon intensity
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Refresh Telemetry
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">Total Estimated CO₂ (This Month)</span>
          <span className="text-2xl font-black text-emerald-400">{data.totalCO2Tonnes} Tonnes</span>
          <p className="text-[10px] text-slate-500 mt-1">Based on diesel emission factor 2.68 kg/L</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">Average CO₂ / Vehicle</span>
          <span className="text-2xl font-black text-slate-100">{data.avgCO2PerVehicle} Tonnes</span>
          <p className="text-[10px] text-slate-500 mt-1">Across active fleet assets</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">CO₂ Reduction vs Last Month</span>
          <span className="text-2xl font-black text-amber-400 flex items-center gap-1">
            <TrendingDown className="w-5 h-5" /> -{data.reductionVsLastMonth}%
          </span>
          <p className="text-[10px] text-emerald-400 mt-1">Efficiency optimization trend</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">Tree Carbon Offset Equivalent</span>
          <span className="text-2xl font-black text-cyan-400">{data.treeEquivalents} Trees</span>
          <p className="text-[10px] text-slate-500 mt-1">Annual absorption equivalent</p>
        </div>
      </div>

      {/* Vehicle Carbon Intensity Breakdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" /> Vehicle-by-Vehicle Carbon Intensity
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {data.vehicleBreakdown?.length || 0} Assets Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Vehicle Reg</th>
                <th className="p-4">Model</th>
                <th className="p-4">Assigned Driver</th>
                <th className="p-4">Estimated CO₂</th>
                <th className="p-4">ESG Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {(data.vehicleBreakdown || []).map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-slate-100">{v.registration}</td>
                  <td className="p-4 text-slate-300">{v.makeModel}</td>
                  <td className="p-4 text-slate-400">{v.driver}</td>
                  <td className="p-4 font-mono font-bold text-amber-400">{v.co2Tonnes} Tonnes</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                        v.rating.includes('A+')
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : v.rating.includes('B')
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {v.rating}
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
