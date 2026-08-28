import React from 'react';
import { User, Shield, Mail, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <User className="w-6 h-6 text-amber-400" /> User Profile & Identity
        </h1>
        <p className="text-xs text-slate-400 mt-1">Authenticated user session information & active portal privileges</p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4 text-xs">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-100">{user?.name || 'Super Admin'}</h2>
            <p className="text-xs text-amber-400 font-bold">{user?.role || 'Super Admin'}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-slate-500 block text-[10px]">Email Address</span>
            <span className="font-semibold text-slate-200">{user?.email || 'admin@smartfleet.ai'}</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-slate-500 block text-[10px]">Portal Access Level</span>
            <span className="font-semibold text-emerald-400">{user?.role} Privileges Authorized</span>
          </div>
        </div>
      </div>
    </div>
  );
}
