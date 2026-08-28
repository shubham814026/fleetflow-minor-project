import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import gpsService from '../../services/gpsService';
import { alertApi } from '../../api';

export default function DriverSOSPage() {
  const [sosActive, setSosActive] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const triggerSOS = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      const pos = await gpsService.getCurrentLocation();
      const payload = {
        driverId: 'drv-201',
        driverName: 'Rajesh Kumar',
        vehicleId: 'veh-101',
        vehicleReg: 'KA-01-EQ-9042',
        lat: pos.latitude,
        lng: pos.longitude,
        timestamp: new Date().toISOString()
      };

      await alertApi.sendSOS(payload);
      setSosActive(true);
    } catch (err) {
      alert('Error broadcasting SOS location: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelSOS = () => {
    setSosActive(false);
    alert('SOS alert deactivated.');
  };

  return (
    <div className="space-y-6 text-center">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
        <div className="w-16 h-16 rounded-full bg-rose-600/20 border-2 border-rose-500 text-rose-500 flex items-center justify-center mx-auto animate-pulse">
          <AlertOctagon className="w-10 h-10" />
        </div>
        <h1 className="text-xl font-black text-slate-100">Emergency Panic Button</h1>
        <p className="text-xs text-slate-400">Instantly transmits live GPS coordinates & vehicle alert to Fleet Command</p>
      </div>

      {!sosActive ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="w-full py-8 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xl rounded-3xl shadow-2xl shadow-rose-600/40 animate-pulse border-2 border-rose-400"
        >
          {loading ? 'TRANSMITTING SOS...' : 'TRIGGER SOS ALERT'}
        </button>
      ) : (
        <div className="bg-rose-950/40 border-2 border-rose-500 p-6 rounded-2xl shadow-2xl space-y-4">
          <div className="flex items-center justify-center gap-2 text-rose-400 font-extrabold text-sm animate-bounce">
            <ShieldAlert className="w-5 h-5" /> CRITICAL SOS EMERGENCY ACTIVE
          </div>
          <p className="text-xs text-slate-300">Live GPS tracking transmitted to Fleet Control Room.</p>
          <button
            onClick={cancelSOS}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs"
          >
            Cancel / Resolve Emergency
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xs w-full space-y-4 shadow-2xl">
            <AlertOctagon className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
            <h3 className="font-extrabold text-sm text-slate-100">Confirm Emergency Dispatch</h3>
            <p className="text-xs text-slate-400">Are you sure you want to trigger immediate SOS dispatch?</p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={triggerSOS}
                className="flex-1 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs"
              >
                TRIGGER SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
