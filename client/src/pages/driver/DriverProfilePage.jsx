import React from 'react';
import { User, Shield, Star, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DriverProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
          {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RK'}
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-100">{user?.name || 'Rajesh Kumar'}</h2>
          <p className="text-xs text-amber-400 font-bold">Class A Heavy Hauler Licence</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-3 text-xs">
        <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-slate-400">Driver Safety Rating</span>
          <span className="font-black text-emerald-400 text-sm">92 / 100</span>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-slate-400">Total Completed Trips</span>
          <span className="font-bold text-slate-100">342 Trips</span>
        </div>
      </div>
    </div>
  );
}
