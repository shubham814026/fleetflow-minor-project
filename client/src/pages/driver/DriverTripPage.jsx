import React, { useState, useEffect } from 'react';
import { Navigation, Gauge, Clock, MapPin, Radio, ShieldCheck } from 'lucide-react';
import gpsService from '../../services/gpsService';

export default function DriverTripPage() {
  const [speed, setSpeed] = useState(68);
  const [distance, setDistance] = useState(142.5);
  const [duration, setDuration] = useState('2h 45m');

  useEffect(() => {
    // Poll or listen to live GPS position
    const interval = setInterval(() => {
      setSpeed((prev) => Math.max(40, Math.min(85, prev + Math.floor(Math.random() * 7) - 3)));
      setDistance((prev) => parseFloat((prev + 0.1).toFixed(1)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-5">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-center space-y-3">
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Active Telemetry Feed</span>
        
        {/* Speedometer Gauge Display */}
        <div className="w-36 h-36 rounded-full bg-slate-950 border-4 border-emerald-500/80 flex flex-col items-center justify-center mx-auto shadow-2xl shadow-emerald-500/10">
          <span className="text-3xl font-black text-slate-100">{speed}</span>
          <span className="text-[10px] text-slate-400 uppercase font-bold">km / h</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Distance Travelled</span>
            <span className="text-base font-black text-amber-400">{distance} km</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Trip Duration</span>
            <span className="text-base font-black text-slate-100">{duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
