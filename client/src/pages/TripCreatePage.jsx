import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Waypoints,
  ArrowLeft,
  Truck,
  UserCheck,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Fuel,
  Gauge,
  Plus,
  Compass,
  Navigation,
  Sparkles
} from 'lucide-react';
import { tripApi, vehicleApi, driverApi } from '../api';
import { geocodeLocation } from '../services/geocodingService';

const SUGGESTED_HUBS = [
  'Bengaluru ICD Nelamangala',
  'Chennai Port Container Terminal',
  'JNPT Port Navi Mumbai',
  'Chakan Industrial Zone Pune',
  'Gurugram Warehousing Hub',
  'Jaipur Logistics Park',
  'Ahmedabad Logistics Park',
  'Surat Diamond Cargo Hub',
  'Kolkata Port Container Terminal',
  'Hyderabad ICD Sanath Nagar',
  'Mysuru Industrial Estate',
  'Hosur Manufacturing Corridor',
  'Delhi Cargo Terminal',
  'Vadodara Industrial Corridor'
];

// Helper to estimate direct distance in km
function calculateEstimatedDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.25); // ~1.25 highway routing factor
}

export default function TripCreatePage() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [form, setForm] = useState({
    vehicleReg: '',
    vehicleId: '',
    driverName: '',
    driverId: '',
    origin: '',
    destination: ''
  });

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [onlyNeverAssigned, setOnlyNeverAssigned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Geocoding states for live route planning from user entered locations
  const [originGeo, setOriginGeo] = useState(null);
  const [destGeo, setDestGeo] = useState(null);
  const [originLoading, setOriginLoading] = useState(false);
  const [destLoading, setDestLoading] = useState(false);

  // 1. Fetch fleet vehicles, trips, and drivers
  useEffect(() => {
    async function loadData() {
      setDataLoading(true);
      try {
        const [vehiclesData, tripsData, driversData] = await Promise.all([
          vehicleApi.getAll().catch(() => []),
          tripApi.getAll().catch(() => []),
          driverApi.getAll().catch(() => [])
        ]);

        const vehList = Array.isArray(vehiclesData) ? vehiclesData : [];
        const tripList = Array.isArray(tripsData) ? tripsData : [];
        const drvList = Array.isArray(driversData) ? driversData : [];

        setVehicles(vehList);
        setTrips(tripList);
        setDrivers(drvList);
      } catch (err) {
        console.error('Error loading fleet data for trip dispatcher:', err);
      } finally {
        setDataLoading(false);
      }
    }

    loadData();
  }, []);

  // 2. Identify active trips and unassigned/available trucks
  const { availableTrucks, activeTripsCount } = useMemo(() => {
    // Active trips are any runs in progress or scheduled
    const activeTrips = trips.filter(
      (t) =>
        t.status &&
        t.status.toLowerCase() !== 'completed' &&
        t.status.toLowerCase() !== 'cancelled'
    );

    const busyVehicleRegs = new Set(
      activeTrips.map((t) => t.vehicleReg?.trim().toUpperCase()).filter(Boolean)
    );
    const busyVehicleIds = new Set(activeTrips.map((t) => t.vehicleId).filter(Boolean));

    // Also track all trips ever to distinguish never-assigned trucks
    const allTripsVehicleRegs = new Set(
      trips.map((t) => t.vehicleReg?.trim().toUpperCase()).filter(Boolean)
    );
    const allTripsVehicleIds = new Set(trips.map((t) => t.vehicleId).filter(Boolean));

    const available = vehicles
      .filter((v) => {
        const reg = v.registration?.trim().toUpperCase();
        const isBusyInTrip = busyVehicleRegs.has(reg) || busyVehicleIds.has(v.id);
        const isCurrentlyMoving = v.status?.toLowerCase() === 'moving';

        // Truck must not be in an active trip and not actively moving
        if (isBusyInTrip || isCurrentlyMoving) return false;

        // If user toggles "only trucks never assigned to any trip"
        if (onlyNeverAssigned) {
          const hasAnyTripRecord = allTripsVehicleRegs.has(reg) || allTripsVehicleIds.has(v.id);
          return !hasAnyTripRecord;
        }

        return true;
      })
      .map((v) => {
        const reg = v.registration?.trim().toUpperCase();
        const hasAnyTripRecord = allTripsVehicleRegs.has(reg) || allTripsVehicleIds.has(v.id);
        return {
          ...v,
          isNeverAssigned: !hasAnyTripRecord
        };
      });

    return {
      availableTrucks: available,
      activeTripsCount: activeTrips.length
    };
  }, [vehicles, trips, onlyNeverAssigned]);

  // Group available trucks for intuitive dropdown display
  const { neverDispatchedTrucks, tripCompletedTrucks } = useMemo(() => {
    const never = availableTrucks.filter((v) => v.isNeverAssigned);
    const completed = availableTrucks.filter((v) => !v.isNeverAssigned);
    return { neverDispatchedTrucks: never, tripCompletedTrucks: completed };
  }, [availableTrucks]);

  // Pre-select first available truck once data loads if none selected
  useEffect(() => {
    if (!form.vehicleReg && availableTrucks.length > 0) {
      const first = availableTrucks[0];
      setForm((prev) => ({
        ...prev,
        vehicleReg: first.registration,
        vehicleId: first.id,
        driverName: first.assignedDriverName || prev.driverName || '',
        driverId: first.assignedDriverId || prev.driverId || ''
      }));
      setSelectedVehicle(first);
    }
  }, [availableTrucks, form.vehicleReg]);

  // 3. Debounced live geocoding of entered origin location
  useEffect(() => {
    if (!form.origin?.trim()) {
      setOriginGeo(null);
      setOriginLoading(false);
      return;
    }

    setOriginLoading(true);
    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        const geo = await geocodeLocation(form.origin);
        if (!isCancelled) {
          setOriginGeo(geo);
        }
      } catch (e) {
        console.warn('Origin geocode error:', e);
      } finally {
        if (!isCancelled) setOriginLoading(false);
      }
    }, 450);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [form.origin]);

  // 4. Debounced live geocoding of entered destination location
  useEffect(() => {
    if (!form.destination?.trim()) {
      setDestGeo(null);
      setDestLoading(false);
      return;
    }

    setDestLoading(true);
    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        const geo = await geocodeLocation(form.destination);
        if (!isCancelled) {
          setDestGeo(geo);
        }
      } catch (e) {
        console.warn('Destination geocode error:', e);
      } finally {
        if (!isCancelled) setDestLoading(false);
      }
    }, 450);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [form.destination]);

  // Estimated highway distance
  const estimatedHighwayKm = useMemo(() => {
    if (originGeo?.lat && originGeo?.lng && destGeo?.lat && destGeo?.lng) {
      return calculateEstimatedDistance(
        originGeo.lat,
        originGeo.lng,
        destGeo.lat,
        destGeo.lng
      );
    }
    return null;
  }, [originGeo, destGeo]);

  const handleTruckChange = (e) => {
    const reg = e.target.value;
    const veh = vehicles.find((v) => v.registration === reg || v.id === reg);

    setSelectedVehicle(veh || null);
    setForm((prev) => ({
      ...prev,
      vehicleReg: reg,
      vehicleId: veh?.id || '',
      driverName: veh?.assignedDriverName || prev.driverName || '',
      driverId: veh?.assignedDriverId || prev.driverId || ''
    }));
  };

  const handleDriverChange = (e) => {
    const driverName = e.target.value;
    const d = drivers.find((x) => x.name === driverName);
    setForm((prev) => ({
      ...prev,
      driverName,
      driverId: d?.id || prev.driverId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.vehicleReg) {
      setError('Please select an available truck from the dropdown.');
      return;
    }
    if (!form.driverName.trim()) {
      setError('Please specify an assigned driver name for this run.');
      return;
    }
    if (!form.origin.trim() || !form.destination.trim()) {
      setError('Please enter both origin and destination locations.');
      return;
    }

    setLoading(true);
    try {
      // Resolve exact coordinates from user-entered locations (never fixed pre-defined locations)
      const resolvedOrigin =
        originGeo ||
        (await geocodeLocation(form.origin, [
          selectedVehicle?.lat || 12.9716,
          selectedVehicle?.lng || 77.5946
        ]));

      const resolvedDest =
        destGeo ||
        (await geocodeLocation(form.destination, [13.0827, 80.2707]));

      const distance =
        estimatedHighwayKm ||
        calculateEstimatedDistance(
          resolvedOrigin?.lat,
          resolvedOrigin?.lng,
          resolvedDest?.lat,
          resolvedDest?.lng
        ) ||
        150;

      const payload = {
        ...form,
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        startLocation: {
          lat: resolvedOrigin?.lat || 12.9716,
          lng: resolvedOrigin?.lng || 77.5946,
          address: resolvedOrigin?.displayName || form.origin.trim()
        },
        endLocation: {
          lat: resolvedDest?.lat || 13.0827,
          lng: resolvedDest?.lng || 80.2707,
          address: resolvedDest?.displayName || form.destination.trim()
        },
        distanceKm: distance,
        durationHours: Number((distance / 52).toFixed(1))
      };

      const created = await tripApi.startTrip(payload);
      if (created?.id) {
        navigate(`/trips/${created.id}`);
      } else {
        navigate('/trips');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Failed to dispatch trip. Please verify locations and truck availability.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/trips')}
        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dispatcher
      </button>

      <div className="bg-slate-900/90 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <Waypoints className="w-6 h-6 text-amber-400" /> Dispatch New Trip
            </h1>
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
              Dynamic Route Planner
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Plan a custom transit corridor based on your entered source and destination locations.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Dropdown for Available Unassigned Trucks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-slate-200 font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400" /> Available Fleet Truck
              </label>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-medium">
                  {dataLoading ? (
                    'Scanning fleet...'
                  ) : (
                    <>
                      <strong className="text-emerald-400">{availableTrucks.length}</strong> available
                      {activeTripsCount > 0 && (
                        <span className="text-slate-500 ml-1">({activeTripsCount} on active runs)</span>
                      )}
                    </>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => setOnlyNeverAssigned(!onlyNeverAssigned)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    onlyNeverAssigned
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                  title="Filter to only trucks with 0 past trips"
                >
                  {onlyNeverAssigned ? '★ Only Never Assigned' : 'Filter: All Available'}
                </button>
              </div>
            </div>

            {dataLoading ? (
              <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-slate-500 text-xs animate-pulse">
                Loading available trucks...
              </div>
            ) : availableTrucks.length === 0 ? (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 space-y-2">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" /> No available unassigned trucks found in fleet.
                </p>
                <p className="text-[11px] text-slate-300">
                  All registered fleet trucks are currently assigned to active runs ({activeTripsCount} active trips).
                </p>
                <NavLink
                  to="/vehicles/create"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 underline hover:text-amber-300 pt-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Register New Fleet Truck
                </NavLink>
              </div>
            ) : (
              <div className="relative">
                <select
                  required
                  value={form.vehicleReg}
                  onChange={handleTruckChange}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 font-medium text-xs focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="" disabled>
                    -- Select an Available Unassigned Truck --
                  </option>

                  {neverDispatchedTrucks.length > 0 && (
                    <optgroup label="★ Unassigned Trucks (Never Assigned to Any Trip)">
                      {neverDispatchedTrucks.map((v) => (
                        <option key={v.id} value={v.registration}>
                          {v.registration} — {v.makeModel || 'Commercial Carrier'} ({v.type || 'Truck'}) [Status: {v.status?.toUpperCase() || 'IDLE'}]
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {tripCompletedTrucks.length > 0 && !onlyNeverAssigned && (
                    <optgroup label="✓ Available Trucks (Previous Run Completed)">
                      {tripCompletedTrucks.map((v) => (
                        <option key={v.id} value={v.registration}>
                          {v.registration} — {v.makeModel || 'Commercial Carrier'} ({v.type || 'Truck'}) [Status: {v.status?.toUpperCase() || 'IDLE'}]
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            )}

            {/* Selected Truck Live Telemetry Preview Card */}
            {selectedVehicle && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 animate-fadeIn text-[11px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-400 text-xs">
                      {selectedVehicle.registration}
                    </span>
                    <span className="text-slate-400 font-medium">
                      {selectedVehicle.makeModel || 'Commercial Carrier'}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      selectedVehicle.isNeverAssigned
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {selectedVehicle.isNeverAssigned ? 'Never Dispatched' : 'Available / Idle'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-slate-400">
                  <div className="flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-slate-500" />
                    <span>Odo: <strong className="text-slate-200">{selectedVehicle.odometer || 0} km</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-slate-500" />
                    <span>Fuel: <strong className="text-slate-200">{selectedVehicle.fuelLevel || 80}%</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Driver: <strong className="text-slate-200">{selectedVehicle.assignedDriverName || 'Unassigned'}</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Assigned Driver Input / Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-bold flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400" /> Driver Name
              </label>
              {selectedVehicle?.assignedDriverName && (
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Auto-filled from truck assignment
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <select
                value={form.driverName}
                onChange={handleDriverChange}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Choose from Registered Drivers --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.status || 'Active'}) {d.assignedVehicleReg ? `[Truck: ${d.assignedVehicleReg}]` : '[Unassigned]'}
                  </option>
                ))}
              </select>

              <input
                type="text"
                required
                placeholder="Or type driver name manually..."
                value={form.driverName}
                onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Dynamic Origin & Destination Locations with Live Geocoding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin Location */}
            <div className="space-y-1.5">
              <label className="text-slate-200 font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" /> Source (Origin Location)
                </span>
              </label>

              <input
                type="text"
                required
                list="origin-hubs"
                placeholder="Enter city, hub, or address (e.g. Mumbai, Pune, Delhi)..."
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
              <datalist id="origin-hubs">
                {SUGGESTED_HUBS.map((hub) => (
                  <option key={hub} value={hub} />
                ))}
              </datalist>

              {/* Origin Live Resolution Badge */}
              <div className="min-h-[18px]">
                {originLoading ? (
                  <span className="text-[10px] text-amber-400 animate-pulse flex items-center gap-1">
                    <Compass className="w-3 h-3 animate-spin" /> Resolving source location...
                  </span>
                ) : originGeo ? (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>
                      {originGeo.lat.toFixed(4)}° N, {originGeo.lng.toFixed(4)}° E
                    </span>
                    <span className="text-slate-500 font-sans">({originGeo.source})</span>
                  </span>
                ) : form.origin ? (
                  <span className="text-[10px] text-slate-500">
                    Location entered (will resolve on dispatch)
                  </span>
                ) : null}
              </div>
            </div>

            {/* Destination Location */}
            <div className="space-y-1.5">
              <label className="text-slate-200 font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-400" /> Destination Location
                </span>
              </label>

              <input
                type="text"
                required
                list="dest-hubs"
                placeholder="Enter city, hub, or address (e.g. Jaipur, Kolkata, Chennai)..."
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
              <datalist id="dest-hubs">
                {SUGGESTED_HUBS.map((hub) => (
                  <option key={hub} value={hub} />
                ))}
              </datalist>

              {/* Destination Live Resolution Badge */}
              <div className="min-h-[18px]">
                {destLoading ? (
                  <span className="text-[10px] text-amber-400 animate-pulse flex items-center gap-1">
                    <Compass className="w-3 h-3 animate-spin" /> Resolving destination location...
                  </span>
                ) : destGeo ? (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>
                      {destGeo.lat.toFixed(4)}° N, {destGeo.lng.toFixed(4)}° E
                    </span>
                    <span className="text-slate-500 font-sans">({destGeo.source})</span>
                  </span>
                ) : form.destination ? (
                  <span className="text-[10px] text-slate-500">
                    Location entered (will resolve on dispatch)
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Dynamic Planned Route Corridor Preview Banner */}
          {form.origin && form.destination && (
            <div className="p-3.5 bg-slate-950/80 border border-cyan-500/30 rounded-2xl space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Planned Dynamic Route Corridor
                </span>
                {estimatedHighwayKm ? (
                  <span className="px-2 py-0.5 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-[10px] rounded-lg">
                    Est. ~{estimatedHighwayKm} km Highway Run
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-200">
                <strong className="text-emerald-400">{form.origin}</strong>
                <span className="text-slate-500">⟶</span>
                <strong className="text-rose-400">{form.destination}</strong>
              </div>

              <p className="text-[10px] text-slate-400">
                Turn-by-turn road route and live telemetry will be calculated automatically by OSRM matching your specific locations.
              </p>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading || availableTrucks.length === 0}
            className="w-full mt-3 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <Waypoints className="w-4 h-4" />
            {loading ? 'Dispatching Custom Route...' : 'Dispatch Trip Now'}
          </button>
        </form>
      </div>
    </div>
  );
}
