import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navigation,
  Gauge,
  Clock,
  MapPin,
  Radio,
  ShieldCheck,
  Square,
  AlertOctagon,
  ArrowLeft,
  Activity,
  Compass,
  Play,
  Crosshair,
  Layers,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import gpsService from '../../services/gpsService';
import { tripApi, geofenceApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

// Dynamic vehicle icon
const createVehicleIcon = () =>
  L.divIcon({
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: rgba(16, 185, 129, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 28px; height: 28px; border-radius: 9999px; background: #10b981; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 12px rgba(0,0,0,0.5);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
      </div>
    `,
    className: 'driver-trip-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

// Auto-recenter component with strict coordinate validation
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

// Calculate Haversine distance in kilometers
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

export default function DriverTripPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTrip, setActiveTrip] = useState(null);
  const [anchoredGeofence, setAnchoredGeofence] = useState(null);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('Detecting location...');
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);
  const [gpsAccuracy, setGpsAccuracy] = useState(10);
  const [gpsSource, setGpsSource] = useState('Acquiring GPS...');
  const [distanceKm, setDistanceKm] = useState(0.0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tripPath, setTripPath] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startingTrip, setStartingTrip] = useState(false);

  const prevCoordsRef = useRef(null);
  const watchIdRef = useRef(null);
  const startTimeRef = useRef(null);

  // 1. Initialize Active Trip & Coordinates
  useEffect(() => {
    async function init() {
      let trip = null;
      try {
        const saved = localStorage.getItem('fleetflow_active_trip');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.status === 'In Transit' || parsed.id)) {
            trip = parsed;
          }
        }
      } catch (e) {}

      if (!trip) {
        try {
          const res = await tripApi.getAll();
          const allTrips = Array.isArray(res) ? res : res?.data || [];
          const found = allTrips.find(
            (t) =>
              t.status === 'In Transit' &&
              ((user?.name && t.driverName && t.driverName.toLowerCase().includes(user.name.toLowerCase())) ||
                (user?.id && t.driverId === user.id) ||
                !user?.name)
          );
          if (found) {
            trip = found;
            localStorage.setItem('fleetflow_active_trip', JSON.stringify(found));
          }
        } catch (err) {
          console.warn('Error fetching active trips', err);
        }
      }

      if (trip) {
        setActiveTrip(trip);
        const start = trip.startTime || trip.createdAt || trip.startedAt;
        if (start) {
          startTimeRef.current = new Date(start).getTime();
          const diffSecs = Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000));
          setElapsedSeconds(diffSecs);
        } else {
          startTimeRef.current = Date.now();
        }
      }

      try {
        const savedGeo = localStorage.getItem('fleetflow_driver_geofence');
        if (savedGeo) {
          setAnchoredGeofence(JSON.parse(savedGeo));
        }
      } catch (e) {}

      try {
        const pos = await gpsService.getCurrentLocation();
        if (pos && !isNaN(pos.latitude) && !isNaN(pos.longitude)) {
          const initialPoint = [pos.latitude, pos.longitude];
          setCurrentCoords(initialPoint);
          setGpsAccuracy(pos.accuracy || 10);
          setGpsSource(pos.source || 'Device GPS');
          prevCoordsRef.current = initialPoint;
          setTripPath([initialPoint]);

          gpsService.reverseGeocode(pos.latitude, pos.longitude).then((addr) => {
            if (addr) setCurrentAddress(addr.displayName || `${addr.road}, ${addr.city}`);
          });
        }
      } catch (err) {
        console.warn('Initial GPS fetch error', err);
      }
    }

    init();
  }, [user]);

  // 2. Real-time GPS Watching & Distance Calculation
  useEffect(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (isNaN(lat) || isNaN(lng)) return;

        const newPoint = [lat, lng];
        const rawSpeed = pos.coords.speed;
        const speedKmh = rawSpeed != null && rawSpeed >= 0 ? Math.round(rawSpeed * 3.6) : 0;
        setSpeed(speedKmh);
        setHeading(pos.coords.heading || 0);
        setGpsAccuracy(Math.round(pos.coords.accuracy || 8));
        setGpsSource('High-Accuracy GPS (Live)');
        setCurrentCoords(newPoint);

        if (prevCoordsRef.current) {
          const deltaKm = haversineDistanceKm(
            prevCoordsRef.current[0],
            prevCoordsRef.current[1],
            lat,
            lng
          );
          if (deltaKm > 0.006) {
            setDistanceKm((prev) => parseFloat((prev + deltaKm).toFixed(2)));
            setTripPath((prev) => [...prev, newPoint]);
            prevCoordsRef.current = newPoint;

            gpsService.reverseGeocode(lat, lng).then((addr) => {
              if (addr) setCurrentAddress(addr.displayName || `${addr.road}, ${addr.city}`);
            });
          }
        } else {
          prevCoordsRef.current = newPoint;
          setTripPath([newPoint]);
        }
      },
      (err) => {
        console.warn('GPS tracking watch notice:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // 3. Real Elapsed Timer
  useEffect(() => {
    if (!activeTrip) return;

    const timer = setInterval(() => {
      if (startTimeRef.current) {
        const secs = Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000));
        setElapsedSeconds(secs);
      } else {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTrip]);

  // 4. Start New Trip dynamically if none active
  const handleStartNewTrip = async () => {
    setStartingTrip(true);
    try {
      const pos = await gpsService.getCurrentLocation();
      const addr = await gpsService.reverseGeocode(pos.latitude, pos.longitude);
      const originStr = addr?.city
        ? `${addr.road ? addr.road + ', ' : ''}${addr.city}`
        : `GPS (${pos.latitude.toFixed(3)}, ${pos.longitude.toFixed(3)})`;

      const vehicleReg = user?.assignedVehicleReg || user?.vehicleReg || 'KA-01-EQ-9042';
      const driverName = user?.name || 'Fleet Driver';

      const geo = await geofenceApi.anchorDriverGeofence({
        vehicleReg,
        driverName,
        lat: pos.latitude,
        lng: pos.longitude,
        radius: 12000,
        name: `Driver Corridor (${vehicleReg})`,
        type: 'Permitted'
      });
      setAnchoredGeofence(geo);
      localStorage.setItem('fleetflow_driver_geofence', JSON.stringify(geo));

      const newTrip = await tripApi.startTrip({
        vehicleReg,
        driverName,
        origin: originStr,
        destination: 'Central Logistics Hub',
        startLocation: { lat: pos.latitude, lng: pos.longitude }
      });

      startTimeRef.current = Date.now();
      setElapsedSeconds(0);
      setDistanceKm(0.0);
      setActiveTrip(newTrip);
      localStorage.setItem('fleetflow_active_trip', JSON.stringify(newTrip));
    } catch (err) {
      alert('Failed to start trip: ' + err.message);
    } finally {
      setStartingTrip(false);
    }
  };

  const [showEndModal, setShowEndModal] = useState(false);

  // 5. Complete & End Active Trip
  const handleEndTripClick = () => {
    setShowEndModal(true);
  };

  const confirmEndTrip = async () => {
    setShowEndModal(false);
    setLoading(true);
    try {
      const targetId = activeTrip?.id || activeTrip?.tripCode || 'trip-active';
      await tripApi.endTrip(targetId, {
        distanceKm: Number(distanceKm) || Number(activeTrip?.distanceKm) || 0,
        durationHours: parseFloat((elapsedSeconds / 3600).toFixed(2)) || Number(activeTrip?.durationHours) || 0.1,
        idleMinutes: 0
      });
      localStorage.removeItem('fleetflow_active_trip');
      localStorage.removeItem('fleetflow_trip_path');
      localStorage.removeItem('fleetflow_driver_geofence');
      setActiveTrip(null);
      navigate('/driver/history');
    } catch (err) {
      console.error('Error ending trip', err);
      localStorage.removeItem('fleetflow_active_trip');
      localStorage.removeItem('fleetflow_trip_path');
      localStorage.removeItem('fleetflow_driver_geofence');
      setActiveTrip(null);
      navigate('/driver/history');
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

  // Safe geofence center resolution
  const geofenceCenter =
    Array.isArray(anchoredGeofence?.center) &&
    anchoredGeofence.center.length >= 2 &&
    !isNaN(anchoredGeofence.center[0]) &&
    !isNaN(anchoredGeofence.center[1])
      ? anchoredGeofence.center
      : anchoredGeofence?.lat != null &&
        anchoredGeofence?.lng != null &&
        !isNaN(anchoredGeofence.lat) &&
        !isNaN(anchoredGeofence.lng)
      ? [Number(anchoredGeofence.lat), Number(anchoredGeofence.lng)]
      : null;

  const validCurrentCoords =
    currentCoords &&
    Array.isArray(currentCoords) &&
    !isNaN(currentCoords[0]) &&
    !isNaN(currentCoords[1])
      ? currentCoords
      : [19.076, 72.8777];

  const validTripPath = tripPath.filter(
    (p) => Array.isArray(p) && p.length >= 2 && !isNaN(p[0]) && !isNaN(p[1])
  );

  return (
    <div className="space-y-4 text-left">
      {/* If No Active Trip is Running */}
      {!activeTrip ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
            <Navigation className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-100">No Active Dispatched Trip</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You are currently on standby. Start a new trip from your live GPS coordinates to begin real-time telemetry tracking.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-left max-w-md mx-auto space-y-1">
            <span className="text-[10px] text-slate-500 block font-semibold">Your Detected Origin:</span>
            <span className="font-mono text-emerald-400 font-bold block">
              {currentCoords ? `${currentCoords[0].toFixed(4)}°N, ${currentCoords[1].toFixed(4)}°E` : 'Acquiring GPS...'}
            </span>
            <span className="text-[11px] text-slate-300 block">{currentAddress}</span>
          </div>

          <button
            onClick={handleStartNewTrip}
            disabled={startingTrip}
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 mx-auto shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            {startingTrip ? 'Acquiring GPS & Starting...' : 'START TRIP FROM CURRENT LOCATION'}
          </button>
        </div>
      ) : (
        <>
          {/* Active Trip Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                Active Live Corridor Route
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                TELEMETRY LIVE
              </span>
            </div>

            <h2 className="text-base font-black text-slate-100">
              {activeTrip.tripCode || 'TRP-LIVE'} — {activeTrip.vehicleReg || user?.assignedVehicleReg || 'KA-01-EQ-9042'}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{activeTrip.origin || 'Live GPS Origin'}</span>
              <span className="text-slate-600">→</span>
              <span className="text-slate-200 font-medium">{activeTrip.destination || 'Distribution Hub'}</span>
            </p>

            {/* Dynamic Geofence Compliance Bar */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Geofence Corridor:
              </span>
              <span className="px-2 py-0.5 rounded font-black text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {anchoredGeofence
                  ? `Anchored on Driver GPS (${((anchoredGeofence.radius || 12000) / 1000).toFixed(0)} km)`
                  : 'Corridor Active'}
              </span>
            </div>
          </div>

          {/* Real-Time Speedometer Gauge */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
            <div className="w-40 h-40 rounded-full bg-slate-950 border-4 border-emerald-500/80 flex flex-col items-center justify-center mx-auto shadow-2xl shadow-emerald-500/10 transition-all">
              <span className="text-4xl font-black text-slate-100 font-mono">{speed}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">km / h</span>
              <span className="text-[9px] text-emerald-400 font-mono mt-1">
                {speed > 0 ? 'Vehicle in Motion' : 'Stationary / Idling'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
                <span className="text-[10px] text-slate-500 block font-semibold">Real Distance Logged</span>
                <span className="text-lg font-black text-amber-400 font-mono">{distanceKm} km</span>
                <span className="text-[9px] text-slate-500 block">Calculated via GPS fixes</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
                <span className="text-[10px] text-slate-500 block font-semibold">Real Elapsed Duration</span>
                <span className="text-lg font-black text-slate-100 font-mono">
                  {formatDuration(elapsedSeconds)}
                </span>
                <span className="text-[9px] text-slate-500 block">Continuous duty time</span>
              </div>
            </div>
          </div>

          {/* Real-Time Location Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> Live Telemetry Fix
              </span>
              <span className="text-[10px] font-mono text-emerald-400">{gpsSource}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Current Lat / Lng</span>
                <span className="font-mono text-amber-400 font-bold text-[11px]">
                  {currentCoords ? `${currentCoords[0].toFixed(4)}°, ${currentCoords[1].toFixed(4)}°` : 'Acquiring...'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">GPS Precision</span>
                <span className="font-mono text-cyan-400 font-bold text-[11px]">
                  ±{gpsAccuracy} meters
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">Current Road / Neighborhood:</span>
                <span className="text-slate-200 font-medium">{currentAddress}</span>
              </div>
            </div>
          </div>

          {/* Quick Jump to Full Map */}
          <button
            onClick={() => navigate('/driver/map')}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-amber-400 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Navigation className="w-4 h-4" /> Open Full Interactive GPS Map <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleEndTripClick}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-600/25 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Square className="w-5 h-5 fill-white" />
              {loading ? 'Committing Trip to Ledger...' : 'COMPLETE & COMMIT TRIP'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/driver/sos')}
              className="w-full py-3 bg-slate-900 border border-rose-500/40 text-rose-400 hover:bg-rose-950/40 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" /> Emergency SOS Alert
            </button>
          </div>
        </>
      )}

      {/* In-App Confirm End Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" /> Complete & End Trip?
            </h3>
            <p className="text-xs text-slate-400">
              Finalize route telemetry and commit <span className="text-amber-400 font-bold">{distanceKm} km</span> and duty hours to the official driver logbook.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                Keep Driving
              </button>
              <button
                type="button"
                onClick={confirmEndTrip}
                disabled={loading}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                {loading ? 'Finalizing...' : 'Confirm End Trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
