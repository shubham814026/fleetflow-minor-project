import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { Truck, ShieldAlert, Lock, Unlock, CheckCircle, ArrowLeft, Fuel, Activity, Calendar, Wrench, Sparkles } from 'lucide-react';
import { vehicleApi, mlApi } from '../api';
import SecondaryAuthModal from '../components/SecondaryAuthModal';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [mlInsight, setMlInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    async function loadVehicle() {
      try {
        const [data, mlData] = await Promise.all([
          vehicleApi.getById(id),
          mlApi.getMaintenanceInsights(id)
        ]);
        setVehicle(data);
        setMlInsight(mlData);
      } catch (err) {
        console.error('Error fetching vehicle details', err);
      } finally {
        setLoading(false);
      }
    }
    loadVehicle();
  }, [id]);

  if (loading || !vehicle) {
    return <div className="p-8 text-center text-slate-400 text-xs animate-pulse">Loading vehicle parameters...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <NavLink
          to="/vehicles"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Vehicles
        </NavLink>

        {!isUnlocked ? (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg"
          >
            <Lock className="w-4 h-4" /> Unlock Sensitive Specs (Secondary Auth)
          </button>
        ) : (
          <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold rounded-xl text-xs flex items-center gap-1.5">
            <Unlock className="w-4 h-4" /> Secondary Authorization Granted
          </span>
        )}
      </div>

      {/* Main Overview Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              Vehicle Asset Record
            </span>
            <h1 className="text-2xl font-black text-slate-100">{vehicle.registration}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{vehicle.makeModel} • {vehicle.type}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 block">Status</span>
              <span className="text-xs font-bold text-emerald-400 uppercase">{vehicle.status}</span>
            </div>
            <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 block">Speed</span>
              <span className="text-xs font-bold text-slate-100">{vehicle.speed} km/h</span>
            </div>
          </div>
        </div>

        {/* Basic Operational Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-300 block">Assigned Driver</span>
            <p className="text-sm font-semibold text-amber-400">{vehicle.assignedDriverName || 'None'}</p>
            <p className="text-[11px] text-slate-500">ID: {vehicle.assignedDriverId || 'N/A'}</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-300 block">Odometer Reading</span>
            <p className="text-sm font-semibold text-slate-100">{vehicle.odometer ? vehicle.odometer.toLocaleString() : 0} km</p>
            <p className="text-[11px] text-slate-500">Fuel Level: {vehicle.fuelLevel}%</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-300 block">Compliance Dates</span>
            <p className="text-xs text-slate-400">Insurance: <strong className="text-slate-200">{vehicle.insuranceExpiry}</strong></p>
            <p className="text-xs text-slate-400">PUC: <strong className="text-slate-200">{vehicle.pucExpiry}</strong></p>
          </div>
        </div>

        {/* AI Predictive Maintenance Diagnostics (Model 7.5) */}
        {mlInsight && (
          <div className="border border-purple-500/30 bg-purple-950/10 rounded-xl p-5 relative overflow-hidden space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-slate-100">AI Predictive Maintenance Diagnostics (Model 7.5)</h3>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[9px] font-bold border border-purple-500/40">
                  REAL-TIME INFERENCE
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400">Breakdown Risk:</span>
                <span className={`text-base font-black font-mono ${
                  (mlInsight.breakdownRiskScore || 0) >= 70 ? 'text-rose-400' : (mlInsight.breakdownRiskScore || 0) >= 40 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {mlInsight.breakdownRiskScore}%
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  mlInsight.status === 'Overdue' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  mlInsight.status === 'Due Soon' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {mlInsight.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">Primary Component at Risk</span>
                <span className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  {mlInsight.componentRisk || 'Brake System & Wear'}
                </span>
                <p className="text-[11px] text-slate-400 pt-1">
                  Target Service Due Date: <strong className="text-slate-200">{mlInsight.predictedServiceDue || '2026-10-15'}</strong>
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">Physical Wear Risk Factors</span>
                <ul className="text-[11px] text-slate-300 space-y-1">
                  {mlInsight.riskFactors && mlInsight.riskFactors.length > 0 ? (
                    mlInsight.riskFactors.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> {f}
                      </li>
                    ))
                  ) : (
                    <li className="text-emerald-400">All mechanical telemetry within safe operating parameters.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Sensitive Information Section Gated by Secondary Auth */}
        <div className="border border-slate-800 bg-slate-950/90 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Sensitive Legal & Registration Specs
            </h3>
            <span className="text-[10px] text-slate-500">SRS Credential Verification Layer</span>
          </div>

          {!isUnlocked ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Secondary Authentication Required</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  Chassis Number, Engine Serial, RC Registration details & Insurance Policy Numbers are protected.
                </p>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20"
              >
                Authenticate & View Sensitive Data
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-slate-500 block">Chassis Number</span>
                <span className="font-mono font-bold text-slate-100">{vehicle.sensitive?.chassisNumber || 'MAT74803928174912'}</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-slate-500 block">Engine Number</span>
                <span className="font-mono font-bold text-slate-100">{vehicle.sensitive?.engineNumber || 'ENG-9982314-X'}</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-slate-500 block">RC Registration Number</span>
                <span className="font-mono font-bold text-slate-100">{vehicle.sensitive?.rcNumber || 'KA0120220098712'}</span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-slate-500 block">Insurance Policy ID</span>
                <span className="font-mono font-bold text-slate-100">{vehicle.sensitive?.insurancePolicyNo || 'POL-TAX-998124'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <SecondaryAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsUnlocked(true)}
        title="Secondary Auth - Vehicle Records"
      />
    </div>
  );
}
