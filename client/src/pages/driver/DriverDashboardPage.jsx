import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Truck, Play, Square, AlertOctagon, Wifi, Radio, MapPin, CheckCircle, ShieldCheck, Crosshair, LocateFixed, AlertTriangle, CheckCircle2 } from 'lucide-react';
import gpsService from '../../services/gpsService';
import { tripApi, alertApi, geofenceApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function DriverDashboardPage() {
  const { user } = useAuth();
  const [activeTrip, setActiveTrip] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('Standby');
  const [currentCoords, setCurrentCoords] = useState(null);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [anchoredGeofence, setAnchoredGeofence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gpsFetching, setGpsFetching] = useState(false);
  const [showConfirmStart, setShowConfirmStart] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [terminationReason, setTerminationReason] = useState('Vehicle Breakdown / Mechanical Failure');
  const [customReasonNotes, setCustomReasonNotes] = useState('');

  const navigate = useNavigate();
  const assignedVehicleReg = user?.assignedVehicleReg || user?.vehicleReg || 'KA-01-EQ-9042';
  const driverName = user?.name || 'Fleet Driver';

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fleetflow_active_trip');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.status === 'In Transit') {
          setActiveTrip(parsed);
          setGpsStatus('Tracking Active');
        }
      } else {
        tripApi.getAll({ status: 'In Transit' }).then((data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          const found = list.find(
            (t) =>
              t.status === 'In Transit' &&
              ((user?.name && t.driverName && t.driverName.toLowerCase().includes(user.name.toLowerCase())) ||
                (user?.id && t.driverId === user.id) ||
                !user?.name)
          );
          if (found) {
            setActiveTrip(found);
            setGpsStatus('Tracking Active');
            localStorage.setItem('fleetflow_active_trip', JSON.stringify(found));
          }
        }).catch(() => {});
      }

      const savedGeo = localStorage.getItem('fleetflow_driver_geofence');
      if (savedGeo) {
        setAnchoredGeofence(JSON.parse(savedGeo));
      }
    } catch (e) {}

    const handleTripEnded = () => {
      setActiveTrip(null);
      setGpsStatus('Standby');
    };
    window.addEventListener('fleetflow_trip_ended', handleTripEnded);

    // Fetch initial device GPS coordinates immediately
    gpsService.getCurrentLocation().then((pos) => {
      setCurrentCoords(pos);
      setGpsStatus('Live GPS Ready');
      gpsService.reverseGeocode(pos.latitude, pos.longitude).then((addr) => {
        if (addr) setCurrentAddress(addr.displayName || `${addr.road}, ${addr.city}`);
      });
    }).catch(() => {});

    return () => {
      window.removeEventListener('fleetflow_trip_ended', handleTripEnded);
    };
  }, [user]);

  // Quick GPS test and anchor geofence directly to driver's real position
  const handleAnchorGeofenceNow = async () => {
    setGpsFetching(true);
    try {
      const pos = await gpsService.getCurrentLocation();
      setCurrentCoords(pos);
      setGpsStatus('GPS Fix Acquired');

      const addr = await gpsService.reverseGeocode(pos.latitude, pos.longitude);
      if (addr) setCurrentAddress(addr.displayName || `${addr.road}, ${addr.city}`);

      const geo = await geofenceApi.anchorDriverGeofence({
        vehicleReg: assignedVehicleReg,
        driverName,
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

      const addr = await gpsService.reverseGeocode(pos.latitude, pos.longitude);
      const originTitle = addr?.city ? `${addr.road ? addr.road + ', ' : ''}${addr.city}` : `Live GPS (${pos.latitude.toFixed(3)}, ${pos.longitude.toFixed(3)})`;

      // 2. Anchor geofence directly to the driver's current coordinates (not randomly!)
      const geo = await geofenceApi.anchorDriverGeofence({
        vehicleReg: assignedVehicleReg,
        driverName,
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
        driverName,
        origin: originTitle,
        destination: 'Regional Logistics Distribution Center',
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

  const getDestinationCoords = () => {
    if (activeTrip?.endLocation?.lat != null && activeTrip?.endLocation?.lng != null) {
      return [Number(activeTrip.endLocation.lat), Number(activeTrip.endLocation.lng)];
    }
    const dest = (activeTrip?.destination || '').toLowerCase();
    if (dest.includes('chennai')) return [13.0827, 80.2707];
    if (dest.includes('pune') || dest.includes('chakan')) return [18.7600, 73.8500];
    if (dest.includes('jaipur')) return [26.9124, 75.7873];
    if (dest.includes('mysuru')) return [12.2958, 76.6394];
    if (dest.includes('bengaluru')) return [12.9716, 77.5946];
    return null;
  };

  const destCoords = getDestinationCoords();
  const currentLat = currentCoords?.latitude ?? currentCoords?.[0];
  const currentLng = currentCoords?.longitude ?? currentCoords?.[1];

  const distanceToDestination =
    destCoords && currentLat != null && currentLng != null
      ? haversineDistanceKm(currentLat, currentLng, destCoords[0], destCoords[1])
      : null;

  const isNearDestination = distanceToDestination != null ? distanceToDestination <= 1.5 : false;

  const confirmEndTrip = async () => {
    setShowConfirmEnd(false);
    setLoading(true);

    try {
      gpsService.stopTracking();
      setGpsStatus('Standby');

      const isEarly = !isNearDestination;
      const fullReason = isEarly
        ? (customReasonNotes.trim() ? `${terminationReason} - ${customReasonNotes.trim()}` : terminationReason)
        : null;

      const targetId = activeTrip?.id || activeTrip?.tripCode || 'trip-active';
      await tripApi.endTrip(targetId, {
        distanceKm: Number(activeTrip?.distanceKm) || 14.5,
        durationHours: Number(activeTrip?.durationHours) || 1.2,
        idleMinutes: 10,
        isEarlyTermination: isEarly,
        terminationReason: fullReason,
        distanceFromDestinationKm: distanceToDestination ? parseFloat(distanceToDestination.toFixed(1)) : null,
        endLocation: currentLat != null && currentLng != null
          ? { lat: currentLat, lng: currentLng, address: currentAddress || 'Roadside Stop' }
          : undefined
      });

      localStorage.removeItem('fleetflow_active_trip');
      localStorage.removeItem('fleetflow_trip_path');
      localStorage.removeItem('fleetflow_driver_geofence');
      setActiveTrip(null);
      navigate('/driver/history');
    } catch (err) {
      console.error('Error completing trip', err);
      localStorage.removeItem('fleetflow_active_trip');
      localStorage.removeItem('fleetflow_trip_path');
      localStorage.removeItem('fleetflow_driver_geofence');
      setActiveTrip(null);
      navigate('/driver/history');
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

      {/* Confirm End Modal with Smart Proximity Gate */}
      {showConfirmEnd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-left">
            {isNearDestination ? (
              // Case 1: Arrived at destination (Within 1.5 km)
              <>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1.5">
                  <h3 className="font-extrabold text-base text-slate-100">Destination Reached</h3>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-semibold text-xs">
                    <MapPin className="w-3.5 h-3.5" /> Within {distanceToDestination ? distanceToDestination.toFixed(2) : '1.0'} km of drop-off
                  </div>
                  <p className="text-xs text-slate-400 pt-1">
                    You have arrived at <strong className="text-slate-200">{activeTrip?.destination || 'Destination Hub'}</strong>. Confirm to finalize mileage and record completion.
                  </p>
                </div>
              </>
            ) : (
              // Case 2: Ending Before Destination (Early Termination Warning)
              <>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <div className="text-center space-y-1.5">
                  <h3 className="font-extrabold text-base text-slate-100">Early Route Termination</h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 font-mono text-xs font-bold">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {distanceToDestination ? `${distanceToDestination.toFixed(1)} km away from destination` : 'Destination not reached'}
                  </div>
                  <p className="text-xs text-slate-400 pt-1">
                    Designated destination: <strong className="text-slate-200">{activeTrip?.destination || 'Regional Logistics Hub'}</strong>. Ending now will flag this run as an <span className="text-amber-400 font-semibold">Early Incomplete Route</span> in the dispatch audit log.
                  </p>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Reason for Stopping Early:
                  </label>
                  <select
                    value={terminationReason}
                    onChange={(e) => setTerminationReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-amber-500"
                  >
                    <option value="Vehicle Breakdown / Mechanical Failure">Vehicle Breakdown / Mechanical Failure</option>
                    <option value="Emergency Road Detour / Traffic Blockage">Emergency Road Detour / Traffic Blockage</option>
                    <option value="Customer Cancellation / Consignee Refusal">Customer Cancellation / Consignee Refusal</option>
                    <option value="Driver Shift Handover / Duty Hours Exhausted">Driver Shift Handover / Duty Hours Exhausted</option>
                    <option value="Consignment Offloaded at Alternate Hub">Consignment Offloaded at Alternate Hub</option>
                    <option value="Medical Emergency / Driver Sickness">Medical Emergency / Driver Sickness</option>
                    <option value="Other Roadside Incident">Other Roadside Incident</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Driver Notes (Optional):
                  </label>
                  <input
                    type="text"
                    value={customReasonNotes}
                    onChange={(e) => setCustomReasonNotes(e.target.value)}
                    placeholder="e.g. Engine fault code / puncture at toll gate"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmEnd(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                Keep Driving
              </button>
              <button
                type="button"
                onClick={confirmEndTrip}
                disabled={loading}
                className={`flex-1 py-3 font-black rounded-xl text-xs text-white shadow-lg transition active:scale-95 ${
                  isNearDestination
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 shadow-rose-600/25'
                }`}
              >
                {loading ? 'Submitting...' : isNearDestination ? 'Confirm Delivery' : 'Report & End Run'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
