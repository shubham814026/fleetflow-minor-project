import React, { useState, useEffect } from 'react';
import { History, Waypoints, MapPin, Activity, RefreshCw } from 'lucide-react';
import { tripApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function DriverHistoryPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadHistory() {
    setLoading(true);
    try {
      const data = await tripApi.getAll();
      const list = Array.isArray(data) ? data : [];
      // Filter for this driver if name matches or fallback to all trips
      const driverTrips = list.filter(
        (t) =>
          !user?.name ||
          (t.driverName && t.driverName.toLowerCase().includes(user.name.toLowerCase())) ||
          user.name.toLowerCase().includes('admin') ||
          true
      );
      setTrips(driverTrips);
    } catch (err) {
      console.error('Failed to load driver trip history', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, [user]);

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" /> Driver Trip History
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Verified historical logs, mileage & drop-offs</p>
        </div>
        <button
          onClick={loadHistory}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Activity className="w-5 h-5 text-amber-400 animate-spin mx-auto mb-2" />
            Loading trip history records...
          </div>
        ) : trips.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-900 rounded-2xl border border-slate-800">
            No completed trips recorded yet.
          </div>
        ) : (
          trips.map((t) => (
            <div key={t.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-amber-400">{t.tripCode}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    t.status === 'In Transit'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <p className="font-semibold text-slate-100">{t.origin} → {t.destination}</p>

              <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                <span>{t.distanceKm} km</span>
                <span>{t.durationHours} hrs</span>
                <span>Vehicle: <strong className="text-slate-200">{t.vehicleReg}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
