import React, { useState, useEffect } from 'react';
import { User, Shield, Mail, Key, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [sessionTime, setSessionTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const secondaryToken = sessionStorage.getItem('fleetflow_secondary_token');

  return (
    <div className="space-y-6 max-w-2xl text-left">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <User className="w-6 h-6 text-amber-400" /> User Profile & Identity
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Authenticated session details, assigned role privileges & security status
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5 text-xs">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-100">{user?.name || 'Super Admin'}</h2>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] mt-0.5 border border-amber-500/30">
              {user?.role || 'Super Admin'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" /> Email Address
            </span>
            <span className="font-semibold text-slate-200">{user?.email || 'admin@fleetflow.com'}</span>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Portal Role Authorization
            </span>
            <span className="font-semibold text-emerald-400">{user?.role || 'Super Admin'} Authorized</span>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" /> Secondary Credential Vault Status
            </span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
              secondaryToken
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {secondaryToken ? 'Unlocked & Active' : 'Locked (PIN Required)'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Active Session Timestamp
            </span>
            <span className="font-mono text-slate-300">{sessionTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
