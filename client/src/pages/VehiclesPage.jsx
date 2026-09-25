import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Truck, Plus, Search, ShieldCheck, Eye, Edit, UserCheck, Activity } from 'lucide-react';
import { vehicleApi } from '../api';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const data = await vehicleApi.getAll();
        setVehicles(data);
      } catch (err) {
        console.error('Failed loading vehicles', err);
      } finally {
        setLoading(false);
      }
    }
    loadVehicles();
  }, []);

  const filtered = vehicles.filter(
    (v) =>
      v.registration.toLowerCase().includes(search.toLowerCase()) ||
      v.makeModel.toLowerCase().includes(search.toLowerCase()) ||
      (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-400" /> Vehicle Registry & Assets
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage active fleet trucks, trailers, insurance & driver assignments</p>
        </div>

        <NavLink
          to="/vehicles/create"
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Vehicle
        </NavLink>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by registration number, model or driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Registration</th>
                <th className="p-4">Make & Model</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Assigned Driver</th>
                <th className="p-4">Fuel</th>
                {/* <th className="p-4">Insurance Expiry</th> */}
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-black text-slate-100">{v.registration}</td>
                  <td className="p-4 font-medium text-slate-300">{v.makeModel}</td>
                  <td className="p-4 text-slate-400">{v.type}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase ${v.status === 'moving'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : v.status === 'idle'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : v.status === 'sos'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-700/50 text-slate-400'
                        }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-200">{v.assignedDriverName || 'Unassigned'}</td>
                  <td className="p-4 font-bold text-emerald-400">{v.fuelLevel}%</td>
                  {/* <td className="p-4 text-slate-400">{v.insuranceExpiry}</td> */}
                  <td className="p-4 text-right space-x-2">
                    <NavLink
                      to={`/vehicles/${v.id}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
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
