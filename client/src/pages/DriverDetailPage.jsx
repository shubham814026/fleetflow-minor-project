import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import {
  Users,
  ShieldAlert,
  Lock,
  Unlock,
  ArrowLeft,
  Star,
  Shield,
  CreditCard,
  Home,
  Phone,
  Award,
  Activity,
  CheckCircle,
  X,
  AlertTriangle
} from 'lucide-react';
import { driverApi } from '../api';
import SecondaryAuthModal from '../components/SecondaryAuthModal';

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'Available':
      return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
    case 'On Trip':
      return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    case 'On Leave':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'Suspended':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    case 'Inactive':
    default:
      return 'bg-slate-700/40 text-slate-400 border-slate-600/30';
  }
};

export default function DriverDetailPage() {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Status Change State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadDriver() {
      try {
        const data = await driverApi.getById(id);
        setDriver(data);
        if (data?.status) {
          setSelectedStatus(data.status);
        }
      } catch (err) {
        console.error('Error fetching driver detail', err);
      } finally {
        setLoading(false);
      }
    }
    loadDriver();
  }, [id]);

  const handleAuthSuccess = async () => {
    setIsUnlocked(true);
    setIsAuthModalOpen(false);
    try {
      const data = await driverApi.getById(id);
      setDriver(data);
    } catch (err) {
      console.error('Failed to reload driver data', err);
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus || selectedStatus === driver.status) {
      setIsStatusModalOpen(false);
      return;
    }

    setStatusLoading(true);
    setStatusError('');

    try {
      await driverApi.updateStatus(driver.id, selectedStatus);
      setDriver((prev) => ({ ...prev, status: selectedStatus }));
      setIsStatusModalOpen(false);
      setSuccessMsg(`Driver status updated to "${selectedStatus}" successfully!`);
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      console.error('Failed to update driver status', err);
      setStatusError(err.response?.data?.error?.message || 'Failed to update driver status');
    } finally {
      setStatusLoading(false);
    }
  };

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

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedStatus(driver.status || 'Active');
              setStatusError('');
              setIsStatusModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-amber-400 hover:text-amber-300 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <Activity className="w-4 h-4" /> Change Status
          </button>

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
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

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
            <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-center min-w-[100px]">
              <span className="text-[10px] text-slate-500 block">Current Status</span>
              <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 border ${getStatusBadgeStyle(driver.status)}`}>
                {driver.status || 'Active'}
              </span>
            </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[11px] text-slate-500 block">Status</span>
              <div className="mt-1">
                <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(driver.status)}`}>
                  {driver.status || 'Active'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedStatus(driver.status || 'Active');
                setStatusError('');
                setIsStatusModalOpen(true);
              }}
              className="w-full py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Activity className="w-3.5 h-3.5" /> Change Status
            </button>
          </div>

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

      {/* Change Driver Status Modal */}
      {isStatusModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget && !statusLoading) {
              setIsStatusModalOpen(false);
            }
          }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-100 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-100">Change Driver Status</h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {driver.name} • {driver.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                disabled={statusLoading}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              {statusError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{statusError}</span>
                </div>
              )}

              {/* Current Status Box */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className={`font-bold uppercase px-2.5 py-0.5 rounded-full border text-[11px] ${getStatusBadgeStyle(driver.status)}`}>
                  {driver.status || 'Active'}
                </span>
              </div>

              {/* Status Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Select New Driver Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setStatusError('');
                  }}
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Active">Active (On Duty & Ready for Assignment)</option>
                  <option value="Available">Available (Free / Unassigned)</option>
                  <option value="On Trip">On Trip (Currently on Delivery Route)</option>
                  <option value="On Leave">On Leave (Medical, Vacation or Casual Leave)</option>
                  <option value="Inactive">Inactive (Off Duty / Non-Operational)</option>
                  <option value="Suspended">Suspended (Safety Hold / Administrative Hold)</option>
                </select>
                <p className="text-[10px] text-slate-500">
                  Changing status updates driver availability across fleet scheduling and safety logs.
                </p>
              </div>

              {/* Status Preview Card */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs flex items-center justify-between">
                <span className="text-slate-400">New Status Preview:</span>
                <span className={`font-black uppercase px-2.5 py-0.5 rounded-full border text-[11px] ${getStatusBadgeStyle(selectedStatus)}`}>
                  {selectedStatus}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  disabled={statusLoading}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusLoading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                >
                  {statusLoading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SecondaryAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        title="Secondary Auth - Driver PII Vault"
      />
    </div>
  );
}
