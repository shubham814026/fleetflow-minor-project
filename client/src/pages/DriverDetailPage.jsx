import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { Users, ShieldAlert, Lock, Unlock, ArrowLeft, Star, Shield, CreditCard, Home, Phone, Award } from 'lucide-react';
import { driverApi } from '../api';
import SecondaryAuthModal from '../components/SecondaryAuthModal';

export default function DriverDetailPage() {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    async function loadDriver() {
      try {
        const data = await driverApi.getById(id);
        setDriver(data);
      } catch (err) {
        console.error('Error fetching driver detail', err);
      } finally {
        setLoading(false);
      }
    }
    loadDriver();
  }, [id]);

  if (loading || !driver) {
    return <div className="p-8 text-center text-slate-400 text-xs animate-pulse">Loading driver profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <NavLink
          to="/drivers"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Driver List
        </NavLink>

        {!isUnlocked ? (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg"
          >
            <Lock className="w-4 h-4" /> Unlock Sensitive PII (Secondary Auth)
          </button>
        ) : (
          <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold rounded-xl text-xs flex items-center gap-1.5">
            <Unlock className="w-4 h-4" /> Secondary Authorization Granted
          </span>
        )}
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
              {driver.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-100">{driver.name}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{driver.email} • {driver.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 block">Safety Score</span>
              <span className="text-xs font-black text-emerald-400">{driver.safetyScore}/100</span>
            </div>
            <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 block">Rating</span>
              <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {driver.rating}
              </span>
            </div>
          </div>
        </div>

        {/* Public Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl space-y-1">
            <span className="text-[11px] text-slate-500 block">Assigned Truck</span>
            <p className="text-sm font-bold text-slate-100">{driver.assignedVehicleReg || 'Unassigned'}</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl space-y-1">
            <span className="text-[11px] text-slate-500 block">Driving Experience</span>
            <p className="text-sm font-bold text-slate-100">{driver.experienceYears} Years</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl space-y-1">
            <span className="text-[11px] text-slate-500 block">Completed Trips</span>
            <p className="text-sm font-bold text-slate-100">{driver.totalTrips} Trips</p>
          </div>
        </div>

        {/* Sensitive Driver Information Protected by Secondary Auth */}
        <div className="border border-slate-800 bg-slate-950/90 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Protected Driver PII & Financial Data
            </h3>
            <span className="text-[10px] text-slate-500">Secondary Credential Vault</span>
          </div>

          {!isUnlocked ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Secondary Authentication Required</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  Aadhaar, PAN, Driver Licence Serial, Residential Address & Bank Account details are encrypted.
                </p>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20"
              >
                Unlock Driver PII Data
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-slate-500 block">Aadhaar Number</span>
                <span className="font-mono font-bold text-slate-100">{driver.sensitive?.aadhaarNo || 'XXXX-XXXX-8921'}</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-slate-500 block">PAN Number</span>
                <span className="font-mono font-bold text-slate-100">{driver.sensitive?.panNo || 'ABCDE1234F'}</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-slate-500 block">Licence Number</span>
                <span className="font-mono font-bold text-slate-100">{driver.sensitive?.licenseNumber || 'KA-0120150098234'}</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-slate-500 block">Emergency Contact</span>
                <span className="font-semibold text-slate-100">{driver.sensitive?.emergencyContact || '+91 98765 00001'}</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg md:col-span-2">
                <span className="text-slate-500 block">Residential Address</span>
                <span className="font-medium text-slate-200">{driver.sensitive?.address || '742 10th Cross, Indiranagar, Bengaluru, KA'}</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg md:col-span-2">
                <span className="text-slate-500 block">Bank Account & IFSC</span>
                <span className="font-mono font-bold text-emerald-400">
                  {driver.sensitive?.bankAccountNumber || '91823910293120'} ({driver.sensitive?.bankIfsc || 'SBIN0001234'})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <SecondaryAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsUnlocked(true)}
        title="Secondary Auth - Driver PII Vault"
      />
    </div>
  );
}
