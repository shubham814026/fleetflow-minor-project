import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Waypoints, ArrowLeft } from 'lucide-react';
import { tripApi } from '../api';

export default function TripCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    vehicleReg: 'KA-01-EQ-9042',
    driverName: 'Rajesh Kumar',
    origin: 'Bengaluru ICD Nelamangala',
    destination: 'Chennai Port Container Terminal'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tripApi.startTrip(form);
      navigate('/trips');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <button onClick={() => navigate('/trips')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Dispatcher
      </button>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <Waypoints className="w-6 h-6 text-amber-400" /> Dispatch New Trip
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1">Vehicle Registration</label>
            <input
              type="text"
              required
              value={form.vehicleReg}
              onChange={(e) => setForm({ ...form, vehicleReg: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Driver Name</label>
            <input
              type="text"
              required
              value={form.driverName}
              onChange={(e) => setForm({ ...form, driverName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Origin Location</label>
            <input
              type="text"
              required
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Destination Location</label>
            <input
              type="text"
              required
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            {loading ? 'Dispatching...' : 'Dispatch Trip Now'}
          </button>
        </form>
      </div>
    </div>
  );
}
