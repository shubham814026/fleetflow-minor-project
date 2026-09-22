import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Waypoints, Plus, Search, MapPin, Clock, Eye } from 'lucide-react';
import { tripApi } from '../api';

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrips() {
      try {
        const data = await tripApi.getAll();
        setTrips(data);
      } catch (err) {
        console.error('Failed loading trips', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, []);

  const filtered = trips.filter(
    (t) =>
      t.tripCode.toLowerCase().includes(search.toLowerCase()) ||
      t.vehicleReg.toLowerCase().includes(search.toLowerCase()) ||
      t.driverName.toLowerCase().includes(search.toLowerCase()) ||
      t.origin.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Waypoints className="w-6 h-6 text-amber-400" /> Trip Dispatcher & Operations
          </h1>
          <p className="text-xs text-slate-400 mt-1">Dispatch active trips, monitor routes, distance & idle times</p>
        </div>

        <NavLink
          to="/trips/create"
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Dispatch New Trip
        </NavLink>
      </div>

      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search trip code, vehicle, driver, origin or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Trip Code</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Driver</th>
                <th className="p-4">Origin → Destination</th>
                <th className="p-4">Status</th>
                <th className="p-4">Distance</th>
                <th className="p-4">Idle Time</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-mono font-black text-amber-400">{t.tripCode}</td>
                  <td className="p-4 font-bold text-slate-100">{t.vehicleReg}</td>
                  <td className="p-4 text-slate-300 font-semibold">{t.driverName}</td>
                  <td className="p-4 text-slate-300">
                    <span className="font-semibold text-slate-200">{t.origin}</span> → <span className="text-slate-400">{t.destination}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        t.status === 'In Transit'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : t.status === 'Completed'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-slate-700/50 text-slate-400'
                      }`}
                    >
                      {t.status}
                    </span>
                    {t.isEarlyTermination && (
                      <span
                        className="ml-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block"
                        title={t.terminationReason || 'Ended before reaching destination'}
                      >
                        Early End
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-bold text-slate-100">{t.distanceKm} km</td>
                  <td className="p-4 text-amber-400">{t.idleMinutes} mins</td>
                  <td className="p-4 text-right">
                    <NavLink
                      to={`/trips/${t.id}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details & Route
                    </NavLink>
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
