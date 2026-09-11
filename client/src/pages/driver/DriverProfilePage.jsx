import React, { useState, useEffect } from 'react';
import { User, Shield, Star, Award, Phone, Mail, Truck, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { driverApi } from '../../api';

export default function DriverProfilePage() {
  const { user } = useAuth();
  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDriver() {
      try {
        const list = await driverApi.getAll();
        const drivers = Array.isArray(list) ? list : [];
        const match = drivers.find(
          (d) =>
            (d.email && user?.email && d.email.toLowerCase() === user.email.toLowerCase()) ||
            (d.name && user?.name && d.name.toLowerCase().includes(user.name.toLowerCase()))
        ) || drivers[0];
        setDriverProfile(match);
      } catch (err) {
        console.error('Failed to load driver profile', err);
      } finally {
        setLoading(false);
      }
    }
    loadDriver();
  }, [user]);

  const profile = driverProfile || {
    name: user?.name || 'Rajesh Kumar',
    email: user?.email || 'driver@fleetflow.com',
    phone: '+91 98765 43210',
    assignedVehicleReg: 'KA-01-EQ-9042',
    safetyScore: 94,
    totalTrips: 28,
    rating: 4.9,
    joinedDate: '2025-08-12'
  };

  return (
    <div className="space-y-4 text-left">
      {/* Profile Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
          {profile.name ? profile.name.slice(0, 2).toUpperCase() : 'RK'}
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-100">{profile.name}</h2>
          <p className="text-xs text-amber-400 font-bold">Commercial Heavy Vehicle Driver (Class HGV)</p>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
            Status: Active On Duty
          </span>
        </div>
      </div>

      {/* Dynamic Metrics */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 block font-semibold">Safety Telemetry Score</span>
          <span className="font-black text-emerald-400 text-xl">{profile.safetyScore || 92} / 100</span>
          <span className="text-[9px] text-slate-500 block">Calculated via GPS acceleration</span>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 block font-semibold">Total Verified Trips</span>
          <span className="font-black text-slate-100 text-xl">{profile.totalTrips || 34} Trips</span>
          <span className="text-[9px] text-slate-500 block">100% on-time completion</span>
        </div>
      </div>

      {/* Contact & Assignment Details */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-2.5 text-xs">
        <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2">Driver Credentials</h3>

        <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-slate-400 flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-amber-400" /> Assigned Vehicle
          </span>
          <span className="font-bold text-slate-100 font-mono">{profile.assignedVehicleReg || 'KA-01-EQ-9042'}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-slate-400 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-indigo-400" /> Registered Email
          </span>
          <span className="font-medium text-slate-300">{profile.email}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-slate-400 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-emerald-400" /> Phone Contact
          </span>
          <span className="font-medium text-slate-300">{profile.phone || '+91 98765 00000'}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-slate-400 flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Star Rating
          </span>
          <span className="font-bold text-amber-400">{profile.rating || 4.9} ★★★★★</span>
        </div>
      </div>
    </div>
  );
}
