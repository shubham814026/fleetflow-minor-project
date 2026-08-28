import React from 'react';
import { Leaf, TrendingDown, Truck } from 'lucide-react';

export default function CarbonPage() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <Leaf className="w-6 h-6 text-emerald-400" /> Carbon Footprint & CO₂ Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">ESG sustainability tracking, total CO₂ emissions & vehicle carbon intensity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">Total Estimated CO₂ (This Month)</span>
          <span className="text-2xl font-black text-emerald-400">14.2 Tonnes</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">Average CO₂ / Vehicle</span>
          <span className="text-2xl font-black text-slate-100">2.84 Tonnes</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">CO₂ Reduction vs Last Month</span>
          <span className="text-2xl font-black text-amber-400 flex items-center gap-1">
            <TrendingDown className="w-5 h-5" /> -6.4%
          </span>
        </div>
      </div>
    </div>
  );
}
