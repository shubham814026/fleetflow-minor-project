import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Truck, Play, Square, AlertOctagon, Wifi, Radio, MapPin, CheckCircle, ShieldCheck, Crosshair, LocateFixed } from 'lucide-react';
import gpsService from '../../services/gpsService';
import { tripApi, alertApi, geofenceApi } from '../../api';

export default function DriverDashboardPage() {
  const [activeTrip, setActiveTrip] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('Standby');
  const [currentCoords, setCurrentCoords] = useState(null);
  const [anchoredGeofence, setAnchoredGeofence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gpsFetching, setGpsFetching] = useState(false);
  const [showConfirmStart, setShowConfirmStart] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  const navigate = useNavigate();
  const assignedVehicleReg = 'KA-01-EQ-9042';

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fleetflow_active_trip');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.status === 'In Transit') {
          setActiveTrip(parsed);
          setGpsStatus('Tracking Active');
        }
      }
      const savedGeo = localStorage.getItem('fleetflow_driver_geofence');
      if (savedGeo) {
        setAnchoredGeofence(JSON.parse(savedGeo));
      }
    } catch (e) {}
  }, []);

  // Quick GPS test and anchor geofence directly to driver's real position
  const handleAnchorGeofenceNow = async () => {
    setGpsFetching(true);
    try {
      const pos = await gpsService.getCurrentLocation();
      setCurrentCoords(pos);
      setGpsStatus('GPS Fix Acquired');

      const geo = await geofenceApi.anchorDriverGeofence({
        vehicleReg: assignedVehicleReg,
        driverName: 'Rajesh Kumar',
        lat: pos.latitude,
        lng: pos.longitude,
        radius: 12000,
        name: `Active Driver Corridor (${assignedVehicleReg})`,
        type: 'Permitted'
      });

      setAnchoredGeofence(geo);
      localStorage.setItem('fleetflow_driver_geofence', JSON.stringify(geo));
      alert(`Geofence successfully anchored to your live GPS coordinates:\nLat: ${pos.latitude.toFixed(4)}, Lng: ${pos.longitude.toFixed(4)}\nAllowed Radius: 12.0 km corridor.`);
    } catch (err) {
      alert('GPS Permission or location error: ' + err.message);
    } finally {
      setGpsFetching(false);
    }
  };

  const handleStartTripClick = async () => {
    setShowConfirmStart(true);
  };

  const confirmStartTrip = async () => {
    setShowConfirmStart(false);
    setLoading(true);

    try {
      // 1. Get location permission and initial fix from driver's device
      const pos = await gpsService.getCurrentLocation();
      setCurrentCoords(pos);

      // 2. Anchor geofence directly to the driver's current coordinates (not randomly!)
      const geo = await geofenceApi.anchorDriverGeofence({
        vehicleReg: assignedVehicleReg,
        driverName: 'Rajesh Kumar',
        lat: pos.latitude,
        lng: pos.longitude,
        radius: 12000,
        name: `Active Driver Corridor (${assignedVehicleReg})`,
        type: 'Permitted'
      });
      setAnchoredGeofence(geo);
      localStorage.setItem('fleetflow_driver_geofence', JSON.stringify(geo));

      // 3. Start backend trip record with driver's actual start coordinates
      const newTrip = await tripApi.startTrip({
        vehicleReg: assignedVehicleReg,
        driverName: 'Rajesh Kumar',
        origin: 'Driver Live GPS Origin',
        destination: 'Assigned Logistics Destination',
        startLocation: { lat: pos.latitude, lng: pos.longitude }
      });

      setActiveTrip(newTrip);
      setGpsStatus('Tracking Active');

      // 4. Start continuous watchPosition GPS tracking
      gpsService.startTracking(newTrip.id, (point) => {
        setCurrentCoords(point);
      });

      navigate('/driver/trip');
    } catch (err) {
      alert('GPS Permission or location error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmEndTrip = async () => {
    setShowConfirmEnd(false);
    setLoading(true);

    try {
      gpsService.stopTracking();
      setGpsStatus('Standby');

      if (activeTrip) {
        await tripApi.endTrip(activeTrip.id, {
          distanceKm: 348.5,
          durationHours: 6.5,
          idleMinutes: 24
        });
      }

      setActiveTrip(null);
      alert('Trip Completed! Summary submitted to fleet server.');
    } catch (err) {
      alert('Error completing trip: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Driver Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Assigned Vehicle</span>
              <h3 className="text-base font-black text-slate-100">{assignedVehicleReg}</h3>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
              activeTrip ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {activeTrip ? 'In Transit' : 'Off Duty'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <span className="text-[9px] text-slate-500 block">GPS Signal</span>
              <span className="font-bold text-slate-200">{gpsStatus}</span>
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-blue-400" />
            <div>
              <span className="text-[9px] text-slate-500 block">Network</span>
              <span className="font-bold text-slate-200">{navigator.onLine ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Driver GPS & Dynamic Geofence Anchoring Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="text-xs font-black text-slate-100 uppercase tracking-wide">Live GPS Geofence Anchor</h4>
              <span className="text-[10px] text-slate-400">Anchored directly to your physical coordinates</span>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-black ${
              anchoredGeofence
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {anchoredGeofence ? 'Anchored on Driver GPS' : 'Not Yet Anchored'}
          </span>
        </div>

        {currentCoords ? (
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] space-y-1">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Live Latitude / Longitude:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {currentCoords.latitude?.toFixed(5)}, {currentCoords.longitude?.toFixed(5)}
              </span>
            </div>
            {anchoredGeofence && (
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Permitted Radius:</span>
                <span className="font-mono text-slate-200">{(anchoredGeofence.radius / 1000).toFixed(1)} km corridor</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 italic">
            Tap below to take your device's actual GPS location and pin the geofence to your spot instead of a random zone.
          </p>
        )}

        <button
          onClick={handleAnchorGeofenceNow}
          disabled={gpsFetching || loading}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-98 text-emerald-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-emerald-500/30 transition-all shadow-md"
        >
          <LocateFixed className={`w-4 h-4 text-emerald-400 ${gpsFetching ? 'animate-spin' : ''}`} />
          {gpsFetching ? 'Acquiring GPS Fix...' : 'Fetch GPS & Anchor Geofence to My Location'}
        </button>
      </div>

      {/* Main 3-Tap Action Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-center space-y-4">
        <span className="text-xs text-slate-400 font-medium block">
          {!activeTrip ? 'Tap below to start tracking active trip' : 'Active trip recording in progress...'}
        </span>

        {!activeTrip ? (
          <button
            onClick={handleStartTripClick}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-2xl text-lg flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 transition-transform active:scale-95"
          >
            <Play className="w-6 h-6 fill-slate-950" /> START TRIP
          </button>
        ) : (
          <button
            onClick={() => setShowConfirmEnd(true)}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black rounded-2xl text-lg flex items-center justify-center gap-3 shadow-xl shadow-rose-600/20 transition-transform active:scale-95"
          >
            <Square className="w-6 h-6 fill-white" /> END TRIP
          </button>
        )}
      </div>

      {/* SOS Button */}
      <div className="pt-2">
        <button
          onClick={() => navigate('/driver/sos')}
          className="w-full py-4 bg-rose-600/20 border-2 border-rose-500 text-rose-400 hover:bg-rose-600 hover:text-white font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <AlertOctagon className="w-5 h-5 animate-bounce" /> EMERGENCY SOS PANIC BUTTON
        </button>
      </div>

      {/* Confirm Start Modal */}
      {showConfirmStart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-xs w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-100">Confirm Vehicle & GPS Start</h3>
            <p className="text-xs text-slate-400">Assigned Vehicle: <strong className="text-slate-100">{assignedVehicleReg}</strong></p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmStart(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={confirmStartTrip}
                className="flex-1 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                Confirm & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
