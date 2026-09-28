import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';
import { driverApi } from '../api';
import { useToast } from '../context/ToastContext';

export default function DriverCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '2028-12-31'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await driverApi.create(form);
      if (toast?.success) {
        toast.success('Driver onboarded and stored in database successfully');
      }
      navigate('/drivers');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error?.message || err.message || 'Failed to create driver';
      setErrorMsg(msg);
      if (toast?.error) {
        toast.error(msg);
      }
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

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
            {errorMsg}
          </div>
        )}

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-slate-300 mb-1">Driver License Number</label>
              <input
                type="text"
                placeholder="e.g. DL-0420110098712"
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">License Expiry Date</label>
            <input
              type="date"
              value={form.licenseExpiry}
              onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })}
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
