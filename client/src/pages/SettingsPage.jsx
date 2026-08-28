import React from 'react';
import { Settings, Bell, Shield, Database, Radio } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-400" /> Telemetry & System Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">Configure WebSocket intervals, GPS sync frequency & security policies</p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4 text-xs">
        <h3 className="font-bold text-slate-100 border-b border-slate-800 pb-2">GPS & Telemetry Preferences</h3>

        <div className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
          <div>
            <span className="font-bold text-slate-200 block">Driver GPS Update Interval</span>
            <span className="text-[11px] text-slate-500">SRS interval range: 10–30 seconds</span>
          </div>
          <select className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1 font-bold">
            <option value="15">15 Seconds</option>
            <option value="30">30 Seconds</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
          <div>
            <span className="font-bold text-slate-200 block">Secondary Auth Verification Timeout</span>
            <span className="text-[11px] text-slate-500">Secondary session duration for sensitive views</span>
          </div>
          <select className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1 font-bold">
            <option value="15">15 Minutes</option>
            <option value="30">30 Minutes</option>
          </select>
        </div>
      </div>
    </div>
  );
}
