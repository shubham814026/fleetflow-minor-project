import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Gauge, Clock, MapPin, Radio, ShieldCheck, Square, AlertOctagon, ArrowLeft } from 'lucide-react';
import gpsService from '../../services/gpsService';
import { tripApi } from '../../api';

export default function DriverTripPage() {
  const navigate = useNavigate();
  const [activeTrip, setActiveTrip] = useState(null);
  const [speed, setSpeed] = useState(55);
  const [distance, setDistance] = useState(12.4);
  const [elapsedSeconds, setElapsedSeconds] = useState(840);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Load active trip from storage
    try {
      const saved = localStorage.getItem('fleetflow_active_trip');
      if (saved) {
        setActiveTrip(JSON.parse(saved));
      }
    } catch (e) {}

    // 2. Real-time timer
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // 3. Speedometer & distance simulator
    const speedInterval = setInterval(() => {
      setSpeed((prev) => Math.max(35, Math.min(80, prev + Math.floor(Math.random() * 5) - 2)));
      setDistance((prev) => parseFloat((prev + 0.05).toFixed(2)));
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(speedInterval);
    };
  }, []);

  const handleEndTrip = async () => {
    if (!window.confirm('Are you sure you want to end this active trip?')) return;
    setLoading(true);
    try {
      gpsService.stopTracking();
      if (activeTrip?.id) {
        await tripApi.endTrip(activeTrip.id, {
          distanceKm: distance,
          durationHours: parseFloat((elapsedSeconds / 3600).toFixed(1)),
          idleMinutes: 12
        });
      }
      localStorage.removeItem('fleetflow_active_trip');
      navigate('/driver/history');
    } catch (err) {
      console.error('Error ending trip', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-5 text-left">
      {/* Active Trip Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
            Active Dispatched Route
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
            TRACKING LIVE
          </span>
        </div>

        <h2 className="text-base font-black text-slate-100">
          {activeTrip?.tripCode || 'TRP-2026-LIVE'} — {activeTrip?.vehicleReg || 'KA-01-EQ-9042'}
        </h2>
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          {activeTrip?.origin || 'Bengaluru Nelamangala'} → {activeTrip?.destination || 'Chennai Port'}
        </p>
      </div>

      {/* Speedometer Gauge Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
        <div className="w-40 h-40 rounded-full bg-slate-950 border-4 border-emerald-500/80 flex flex-col items-center justify-center mx-auto shadow-2xl shadow-emerald-500/10">
          <span className="text-4xl font-black text-slate-100 font-mono">{speed}</span>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">km / h</span>
          <span className="text-[9px] text-emerald-400 font-mono mt-1">GPS Latency: 22ms</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
            <span className="text-[10px] text-slate-500 block font-semibold">Distance Logged</span>
            <span className="text-lg font-black text-amber-400 font-mono">{distance} km</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
            <span className="text-[10px] text-slate-500 block font-semibold">Elapsed Duration</span>
            <span className="text-lg font-black text-slate-100 font-mono">{formatDuration(elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <button
          onClick={handleEndTrip}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-600/25 transition-transform active:scale-95"
        >
          <Square className="w-5 h-5 fill-white" />
          {loading ? 'Completing Trip...' : 'COMPLETE & END TRIP'}
        </button>

        <button
          onClick={() => navigate('/driver/sos')}
          className="w-full py-3 bg-slate-900 border border-rose-500/40 text-rose-400 hover:bg-rose-950/40 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" /> Emergency SOS Alert
        </button>
      </div>
    </div>
  );
}
