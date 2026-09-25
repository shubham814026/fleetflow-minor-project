import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Plus, Search, Shield, Eye, Star, Activity, Phone } from 'lucide-react';
import { driverApi } from '../api';

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDrivers() {
      try {
        const data = await driverApi.getAll();
        setDrivers(data);
      } catch (err) {
        console.error('Failed loading drivers', err);
      } finally {
        setLoading(false);
      }
    }
    loadDrivers();
  }, []);

  const filtered = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      (d.assignedVehicleReg && d.assignedVehicleReg.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" /> Driver Management Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">Track driver safety ratings, trips, licence validity & assignments</p>
        </div>

        <NavLink
          to="/drivers/create"
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Driver
        </NavLink>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search driver by name, email or vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Driver Cards / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((drv) => (
          <div key={drv.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shadow-amber-500/20">
                  {drv.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100">{drv.name}</h3>
                  <span className="text-[11px] text-slate-400">{drv.email}</span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  drv.status === 'Active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {drv.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-500 block">Vehicle Reg</span>
                <span className="font-bold text-slate-200">{drv.assignedVehicleReg || 'Unassigned'}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Safety Score</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> {drv.safetyScore} / 100
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Total Trips</span>
                <span className="font-bold text-slate-200">{drv.totalTrips}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Licence Expiry</span>
                <span className="font-semibold text-slate-300">{drv.licenseExpiry}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {drv.rating} Rating
              </span>

              <NavLink
                to={`/drivers/${drv.id}`}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> Full Profile
              </NavLink>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
