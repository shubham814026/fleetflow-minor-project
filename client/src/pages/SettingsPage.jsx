import React, { useState, useEffect } from 'react';
import { Settings, Bell, Shield, Database, Radio, Save, CheckCircle2, Lock, Sliders, RotateCcw, AlertTriangle, IndianRupee, Gauge } from 'lucide-react';
import { settingsApi } from '../api';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    gpsIntervalSec: 15,
    secondaryAuthTimeoutMins: 15,
    enableSoundAlerts: true,
    enableOfflineBuffering: true,
    autoRecenterMap: true,
    mapTileTheme: 'Dark Navigation',
    speedLimitThresholdKmH: 80,
    fuelPricePerLiter: 94.50,
    alertEmailNotifications: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await settingsApi.get();
        if (data) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error('Failed to load settings from server', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await settingsApi.update(settings);
      if (updated) {
        setSettings((prev) => ({ ...prev, ...updated }));
      }
      localStorage.setItem('fleetflow_settings', JSON.stringify(settings));
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 4000);
    } catch (err) {
      console.error('Failed to save settings', err);
      alert('Error saving system preferences: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (!window.confirm('Reset all system preferences to recommended factory defaults?')) return;
    const defaults = {
      gpsIntervalSec: 15,
      secondaryAuthTimeoutMins: 15,
      enableSoundAlerts: true,
      enableOfflineBuffering: true,
      autoRecenterMap: true,
      mapTileTheme: 'Dark Navigation',
      speedLimitThresholdKmH: 80,
      fuelPricePerLiter: 94.50,
      alertEmailNotifications: true
    };
    setSettings(defaults);
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

        {/* Fleet Operations & ML Cost Thresholds */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4 text-xs">
          <h3 className="font-bold text-slate-100 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400" /> Fleet Telemetry & ML Thresholds
          </h3>

          <div className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div>
              <span className="font-bold text-slate-200 block">Speed Limit Alert Threshold</span>
              <span className="text-[11px] text-slate-500">Trigger speeding incident alert when vehicle exceeds this speed</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="40"
                max="140"
                value={settings.speedLimitThresholdKmH || 80}
                onChange={(e) => setSettings({ ...settings, speedLimitThresholdKmH: parseInt(e.target.value, 10) || 80 })}
                className="w-20 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-center focus:outline-none focus:border-amber-500"
              />
              <span className="text-slate-400 font-bold">km/h</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div>
              <span className="font-bold text-slate-200 block">Baseline Diesel Pricing (INR)</span>
              <span className="text-[11px] text-slate-500">Unit rate per liter used by FastAPI ML microservice for fuel theft & excess cost calculation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">₹</span>
              <input
                type="number"
                step="0.5"
                min="50"
                max="200"
                value={settings.fuelPricePerLiter || 94.5}
                onChange={(e) => setSettings({ ...settings, fuelPricePerLiter: parseFloat(e.target.value) || 94.5 })}
                className="w-24 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-center focus:outline-none focus:border-amber-500"
              />
              <span className="text-slate-400 font-bold">/ Liter</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset to Defaults
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving Preferences...' : 'Save System Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
