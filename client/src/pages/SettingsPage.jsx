import React, { useState, useEffect } from 'react';
import { Settings, Bell, Shield, Database, Radio, Save, CheckCircle2, Lock, Sliders } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    gpsIntervalSec: 15,
    secondaryAuthTimeoutMins: 15,
    enableSoundAlerts: true,
    enableOfflineBuffering: true,
    autoRecenterMap: true,
    mapTileTheme: 'Dark Navigation'
  });
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('fleetflow_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('fleetflow_settings', JSON.stringify(settings));
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-left">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" /> Telemetry & System Preferences
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure WebSocket telemetry sampling, GPS ping frequency, secondary security vault timeout & notifications
          </p>
        </div>

        {savedToast && (
          <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-bounce-short">
            <CheckCircle2 className="w-4 h-4" /> Preferences Saved!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Telemetry Frequencies */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4 text-xs">
          <h3 className="font-bold text-slate-100 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400" /> GPS & Socket Sampling Intervals
          </h3>

          <div className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div>
              <span className="font-bold text-slate-200 block">Driver Mobile GPS Ping Rate</span>
              <span className="text-[11px] text-slate-500">Frequency of geolocation updates transmitted over WebSockets</span>
            </div>
            <select
              value={settings.gpsIntervalSec}
              onChange={(e) => setSettings({ ...settings, gpsIntervalSec: parseInt(e.target.value, 10) })}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="5">5 Seconds (Ultra Real-Time)</option>
              <option value="15">15 Seconds (Recommended)</option>
              <option value="30">30 Seconds (Battery Saver)</option>
              <option value="60">60 Seconds (Low Bandwidth)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div>
              <span className="font-bold text-slate-200 block">Offline IndexedDB Buffer Queue</span>
              <span className="text-[11px] text-slate-500">Accumulate and backfill GPS track points when cellular signal drops</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableOfflineBuffering}
                onChange={(e) => setSettings({ ...settings, enableOfflineBuffering: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>

        {/* Security & Secondary Vault */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4 text-xs">
          <h3 className="font-bold text-slate-100 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" /> Secondary Credential Vault Security
          </h3>

          <div className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div>
              <span className="font-bold text-slate-200 block">Secondary Auth Verification Timeout</span>
              <span className="text-[11px] text-slate-500">Time before secondary PIN verification expires and re-masks sensitive chassis/RC numbers</span>
            </div>
            <select
              value={settings.secondaryAuthTimeoutMins}
              onChange={(e) => setSettings({ ...settings, secondaryAuthTimeoutMins: parseInt(e.target.value, 10) })}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="5">5 Minutes</option>
              <option value="15">15 Minutes (Standard)</option>
              <option value="30">30 Minutes</option>
              <option value="60">1 Hour</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div>
              <span className="font-bold text-slate-200 block">Audible Emergency Alarms</span>
              <span className="text-[11px] text-slate-500">Play audio sound in dispatch room upon SOS panic or geofence breaches</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableSoundAlerts}
                onChange={(e) => setSettings({ ...settings, enableSoundAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>

        {/* Map Display Preferences */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4 text-xs">
          <h3 className="font-bold text-slate-100 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" /> GIS Map Display
          </h3>

          <div className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div>
              <span className="font-bold text-slate-200 block">Map Visual Theme</span>
              <span className="text-[11px] text-slate-500">Leaflet OpenStreetMap tile styling preference</span>
            </div>
            <select
              value={settings.mapTileTheme}
              onChange={(e) => setSettings({ ...settings, mapTileTheme: e.target.value })}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="Dark Navigation">Dark Navigation Mode</option>
              <option value="Standard OpenStreetMap">Standard OpenStreetMap</option>
              <option value="Satellite Hybrid">Satellite Hybrid Overlay</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
        >
          <Save className="w-4 h-4" /> Save System Preferences
        </button>
      </form>
    </div>
  );
}
