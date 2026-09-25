import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';
import { driverApi } from '../api';

export default function DriverCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    licenseExpiry: '2028-12-31'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await driverApi.create(form);
      navigate('/drivers');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <button onClick={() => navigate('/drivers')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Drivers
      </button>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-400" /> Onboard New Driver
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Vikram Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="vikram@smartfleet.ai"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Phone Number</label>
            <input
              type="text"
              required
              placeholder="+91 98765 11122"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            {loading ? 'Submitting...' : 'Onboard Driver'}
          </button>
        </form>
      </div>
    </div>
  );
}
