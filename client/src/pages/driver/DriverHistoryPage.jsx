import React from 'react';
import { History, Waypoints, MapPin } from 'lucide-react';
import { INITIAL_TRIPS } from '../../api/mockData';

export default function DriverHistoryPage() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" /> Driver Trip History
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Historical trip logs & mileage records</p>
      </div>

      <div className="space-y-3">
        {INITIAL_TRIPS.map((t) => (
          <div key={t.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-amber-400">{t.tripCode}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400">
                {t.status}
              </span>
            </div>

            <p className="font-semibold text-slate-100">{t.origin} → {t.destination}</p>

            <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
              <span>{t.distanceKm} km</span>
              <span>{t.durationHours} hrs</span>
              <span>Vehicle: {t.vehicleReg}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
