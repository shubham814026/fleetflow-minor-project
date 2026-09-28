import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import {
  Truck,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle,
  ArrowLeft,
  Fuel,
  Activity,
  Calendar,
  UserCheck,
  AlertTriangle,
  X,
  Users
} from 'lucide-react';
import { vehicleApi, driverApi } from '../api';
import SecondaryAuthModal from '../components/SecondaryAuthModal';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Reassign Driver Modal State
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [reassignLoading, setReassignLoading] = useState(false);
  const [reassignError, setReassignError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [vData, dData] = await Promise.all([
          vehicleApi.getById(id),
          driverApi.getAll()
        ]);
        setVehicle(vData);
        setDrivers(Array.isArray(dData) ? dData : []);
      } catch (err) {
        console.error('Error fetching vehicle details', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDriverId) return;

    if (vehicle.status === 'moving') {
      setReassignError('Cannot reassign driver while vehicle is in motion.');
      return;
    }

    setReassignLoading(true);
    setReassignError('');

    try {
      if (selectedDriverId === '__unassign__') {
        await vehicleApi.assignDriver(vehicle.id, {
          driverId: null,
          driverName: null
        });
        setVehicle((prev) => ({
          ...prev,
          assignedDriverId: null,
          assignedDriverName: null
        }));
      } else {
        const chosen = drivers.find((d) => d.id === selectedDriverId);
        await vehicleApi.assignDriver(vehicle.id, {
          driverId: selectedDriverId,
          driverName: chosen ? chosen.name : ''
        });
        setVehicle((prev) => ({
          ...prev,
          assignedDriverId: selectedDriverId,
          assignedDriverName: chosen ? chosen.name : prev.assignedDriverName
        }));
      }

      // Refresh drivers directory
      const freshDrivers = await driverApi.getAll();
      setDrivers(Array.isArray(freshDrivers) ? freshDrivers : []);

      setIsReassignModalOpen(false);
      setSuccessMsg('Assigned driver successfully updated!');
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      console.error('Reassignment failed', err);
      setReassignError(err.response?.data?.error?.message || 'Failed to update assigned driver');
    } finally {
      setReassignLoading(false);
    }
  };

  if (loading || !vehicle) {
    return <div className="p-8 text-center text-slate-400 text-xs animate-pulse">Loading vehicle parameters...</div>;
  }

  // Filter available drivers (unassigned or marked available)
  const availableDrivers = drivers.filter(
    (d) =>
      d.id !== vehicle.assignedDriverId &&
      (!d.assignedVehicleId || d.assignedVehicleId === 'None' || d.status === 'Available')
  );

  const otherDrivers = drivers.filter(
    (d) =>
      d.id !== vehicle.assignedDriverId &&
      d.assignedVehicleId &&
      d.assignedVehicleId !== 'None' &&
      d.status !== 'Available'
  );

  const selectedDriverObj = drivers.find((d) => d.id === selectedDriverId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <NavLink
          to="/vehicles"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Vehicles
        </NavLink>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedDriverId(vehicle.assignedDriverId || '');
              setReassignError('');
              setIsReassignModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-amber-400 hover:text-amber-300 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <UserCheck className="w-4 h-4" /> Reassign Driver
          </button>

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
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

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
          <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 block">Assigned Driver</span>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${vehicle.assignedDriverId
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-700/30 text-slate-400 border-slate-600/30'
                    }`}
                >
                  {vehicle.assignedDriverId ? 'Assigned' : 'Unassigned'}
                </span>
              </div>
              <p className="text-sm font-semibold text-amber-400 mt-1">{vehicle.assignedDriverName || 'No Driver Assigned'}</p>
              <p className="text-[11px] text-slate-500">ID: {vehicle.assignedDriverId || 'N/A'}</p>
            </div>

            <button
              onClick={() => {
                setSelectedDriverId(vehicle.assignedDriverId || '');
                setReassignError('');
                setIsReassignModalOpen(true);
              }}
              className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" /> Reassign Driver
            </button>
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

      {/* Reassign Driver Modal */}
      {isReassignModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget && !reassignLoading) {
              setIsReassignModalOpen(false);
            }
          }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-100 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-100">Reassign Vehicle Driver</h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {vehicle.registration} • {vehicle.makeModel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReassignModalOpen(false)}
                disabled={reassignLoading}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* In-motion safety notice */}
            {vehicle.status === 'moving' ? (
              <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-bold">Driver Reassignment Locked: Vehicle is Moving</strong>
                  <p className="text-[11px] text-rose-300/80 leading-relaxed">
                    Fleet safety protocol prohibits changing drivers while a truck is actively in motion ({vehicle.speed} km/h). The vehicle must be stationary (<strong>IDLE</strong> or <strong>OFFLINE</strong>) before changing the assigned driver.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReassignSubmit} className="space-y-4">
                {reassignError && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{reassignError}</span>
                  </div>
                )}

                {/* Current Driver Display */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-400">Currently Assigned:</span>
                  <span className="font-bold text-amber-400">
                    {vehicle.assignedDriverName || 'None (Unassigned)'}
                  </span>
                </div>

                {/* Available Drivers Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Select Available Driver
                  </label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => {
                      setSelectedDriverId(e.target.value);
                      setReassignError('');
                    }}
                    required
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">-- Choose an available driver --</option>
                    <option value="__unassign__">❌ Unassign Driver (Leave Vehicle Unassigned)</option>

                    {availableDrivers.length > 0 && (
                      <optgroup label="Available / Unassigned Drivers">
                        {availableDrivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.phone || d.email}) • Safety: {d.safetyScore || 90}%
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {otherDrivers.length > 0 && (
                      <optgroup label="Other Drivers (Currently Assigned to Another Vehicle)">
                        {otherDrivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} (Assigned to {d.assignedVehicleReg || d.assignedVehicleId})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <p className="text-[10px] text-slate-500">
                    Selecting a new driver will automatically release the previous driver back into the available pool.
                  </p>
                </div>

                {/* Selected Driver Preview Card */}
                {selectedDriverObj && selectedDriverId !== '__unassign__' && (
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-bold text-slate-200">{selectedDriverObj.name}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {selectedDriverObj.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-800/80">
                      <span>Phone: <strong className="text-slate-200">{selectedDriverObj.phone}</strong></span>
                      <span>Safety Score: <strong className="text-emerald-400">{selectedDriverObj.safetyScore || 90}%</strong></span>
                      <span>Experience: <strong className="text-slate-200">{selectedDriverObj.experienceYears || 5} yrs</strong></span>
                      <span>Total Trips: <strong className="text-slate-200">{selectedDriverObj.totalTrips || 0}</strong></span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReassignModalOpen(false)}
                    disabled={reassignLoading}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedDriverId || reassignLoading}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                  >
                    {reassignLoading ? 'Saving...' : 'Confirm Reassignment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <SecondaryAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsUnlocked(true)}
        title="Secondary Auth - Vehicle Records"
      />
    </div>
  );
}
