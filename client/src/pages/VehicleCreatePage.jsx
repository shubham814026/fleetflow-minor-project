import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ArrowLeft } from 'lucide-react';
import { vehicleApi } from '../api';

export default function VehicleCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    registration: '',
    makeModel: '',
    type: 'Heavy Truck',
    fuelLevel: 100,
    odometer: 0
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await vehicleApi.create(form);
      navigate('/vehicles');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <button onClick={() => navigate('/vehicles')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Vehicles
      </button>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <Truck className="w-6 h-6 text-amber-400" /> Register New Fleet Vehicle
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1">Registration Number</label>
            <input
              type="text"
              required
              placeholder="e.g. KA-01-EQ-9042"
              value={form.registration}
              onChange={(e) => setForm({ ...form, registration: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Make & Model</label>
            <input
              type="text"
              required
              placeholder="e.g. Tata Prima 4928.S"
              value={form.makeModel}
              onChange={(e) => setForm({ ...form, makeModel: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Vehicle Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100"
            >
              <option value="Heavy Truck">Heavy Truck</option>
              <option value="Container Truck">Container Truck</option>
              <option value="Medium Duty Truck">Medium Duty Truck</option>
              <option value="Trailer">Trailer</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            {loading ? 'Creating...' : 'Submit Vehicle Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}
