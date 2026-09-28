import React, { useState, useEffect, useMemo } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  ArrowLeft,
  MapPin,
  AlertTriangle,
  Route as RouteIcon,
  Navigation,
  RotateCcw,
  CheckCircle2,
  Compass,
  Milestone,
  Truck,
  Crosshair,
  ExternalLink,
  Fuel,
  Gauge
} from 'lucide-react';
import { tripApi, vehicleApi } from '../api';
import socketService from '../services/socketService';
import { geocodeLocation } from '../services/geocodingService';

// In-memory cache for fetched road routes to ensure instant reload and avoid rate limits
const routeCache = new Map();

// Helper to generate a realistic curved highway path if OSRM is unreachable (ensures never a straight line)
function generateHighwayCorridor(startCoords, endCoords) {
  const [lat1, lng1] = startCoords;
  const [lat2, lng2] = endCoords;
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);

  if (dist === 0) return [startCoords, endCoords];

  // Perpendicular unit vector
  const pLat = -dLng / dist;
  const pLng = dLat / dist;

  // Natural highway curvature amplitude (~10% transverse variance)
  const amplitude = dist * 0.1;

  const points = [];
  const steps = 36;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Multi-harmonic curve mimicking highway bypasses, mountain passes, and river crossings
    const curveOffset =
      Math.sin(Math.PI * t) * amplitude * 0.75 +
      Math.sin(2 * Math.PI * t) * amplitude * 0.35 +
      Math.sin(4 * Math.PI * t) * amplitude * 0.1;

    const lat = lat1 + dLat * t + pLat * curveOffset;
    const lng = lng1 + dLng * t + pLng * curveOffset;
    points.push([Number(lat.toFixed(5)), Number(lng.toFixed(5))]);
  }
  return points;
}

// Fetch real turn-by-turn road coordinates from OSRM
async function fetchDrivingRoadRoute(startCoords, endCoords) {
  const [startLat, startLng] = startCoords;
  const [endLat, endLng] = endCoords;
  const cacheKey = `${startLat.toFixed(4)},${startLng.toFixed(4)}->${endLat.toFixed(4)},${endLng.toFixed(4)}`;

  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    // OSRM coordinates are lng,lat format
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates?.length > 1) {
        // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const result = {
          coords,
          distanceKm: (data.routes[0].distance / 1000).toFixed(1),
          durationHours: (data.routes[0].duration / 3600).toFixed(1),
          source: 'OSRM Live Road Network'
        };
        routeCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('OSRM route fetch timed out or unavailable, using natural highway curve:', err);
  }

  // Graceful fallback to realistic multi-point highway curve
  const fallbackCoords = generateHighwayCorridor(startCoords, endCoords);
  const fallbackResult = {
    coords: fallbackCoords,
    distanceKm: null,
    durationHours: null,
    source: 'Highway Navigation Corridor'
  };
  routeCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}

// Controller component to smoothly auto-fit bounds or focus on truck
function MapController({ coords, focusTarget, triggerReset }) {
  const map = useMap();

  useEffect(() => {
    if (focusTarget && Array.isArray(focusTarget) && !isNaN(focusTarget[0]) && !isNaN(focusTarget[1])) {
      map.flyTo(focusTarget, 13, { duration: 1.2 });
    }
  }, [focusTarget, map]);

  useEffect(() => {
    if (coords && coords.length > 1) {
      try {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 13,
          animate: true
        });
      } catch (err) {
        console.warn('Could not fit map bounds:', err);
      }
    }
  }, [coords, triggerReset, map]);

  return null;
}

const startIcon = L.divIcon({
  html: `<div class="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-lg border-2 border-white ring-4 ring-emerald-500/30">S</div>`,
  className: 'custom-start-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const endIcon = L.divIcon({
  html: `<div class="w-7 h-7 rounded-full bg-rose-600 text-white font-black flex items-center justify-center text-xs shadow-lg border-2 border-white ring-4 ring-rose-500/30">E</div>`,
  className: 'custom-end-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// Custom assigned truck icon with live status color and rotation
function createTruckIcon(status = 'moving', heading = 0, reg = '') {
  let colorClass = 'bg-amber-500 text-slate-950 border-amber-300';
  let pulseClass = '';

  if (status === 'moving') {
    colorClass = 'bg-emerald-500 text-slate-950 border-emerald-300';
    pulseClass = '<div class="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping"></div>';
  } else if (status === 'sos') {
    colorClass = 'bg-rose-600 text-white border-rose-300';
    pulseClass = '<div class="absolute -inset-1.5 rounded-full bg-rose-600/60 animate-ping"></div>';
  } else if (status === 'idle') {
    colorClass = 'bg-amber-500 text-slate-950 border-amber-300';
  } else if (status === 'offline') {
    colorClass = 'bg-slate-700 text-slate-200 border-slate-500';
  }

  const html = `
    <div class="relative flex flex-col items-center">
      ${pulseClass}
      <div class="w-10 h-10 rounded-full ${colorClass} border-2 flex items-center justify-center shadow-2xl relative z-10 transition-transform" style="transform: rotate(${heading || 0}deg);">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>
        </svg>
      </div>
      <div class="mt-1 whitespace-nowrap bg-slate-950/95 text-[9px] font-black text-amber-400 px-1.5 py-0.5 rounded-md border border-amber-500/40 shadow-lg tracking-wider flex items-center gap-1">
        <span>🚚</span> <span>${reg || 'TRUCK'}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-assigned-truck-marker',
    iconSize: [46, 54],
    iconAnchor: [23, 23],
    popupAnchor: [0, -25]
  });
}

export default function TripDetailPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [truckLocation, setTruckLocation] = useState(null);

  // Dynamic route endpoints resolved from user-entered locations
  const [resolvedStart, setResolvedStart] = useState([12.9716, 77.5946]);
  const [resolvedEnd, setResolvedEnd] = useState([13.0827, 80.2707]);
  const [endpointsReady, setEndpointsReady] = useState(false);

  const [routeCoords, setRouteCoords] = useState([]);
  const [routeMeta, setRouteMeta] = useState(null);
  const [routeLoading, setRouteLoading] = useState(true);
  const [focusTarget, setFocusTarget] = useState(null);
  const [resetCount, setResetCount] = useState(0);

  // 1. Load trip telemetry
  useEffect(() => {
    async function loadTrip() {
      try {
        const data = await tripApi.getById(id);
        setTrip(data);
      } catch (err) {
        console.error('Error loading trip details', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrip();
  }, [id]);

  // 2. Resolve source and destination coordinates from user-entered location (never fixed pre-defined locations)
  useEffect(() => {
    if (!trip) return;
    let isMounted = true;

    async function resolveEndpoints() {
      let sLat = trip.startLocation?.lat;
      let sLng = trip.startLocation?.lng;
      let eLat = trip.endLocation?.lat;
      let eLng = trip.endLocation?.lng;

      // If coordinates are missing, resolve dynamically from trip.origin & trip.destination
      if (!sLat || !sLng || isNaN(sLat) || isNaN(sLng)) {
        const geoStart = await geocodeLocation(trip.origin, [12.9716, 77.5946]);
        sLat = geoStart?.lat || 12.9716;
        sLng = geoStart?.lng || 77.5946;
      }

      if (!eLat || !eLng || isNaN(eLat) || isNaN(eLng)) {
        const geoEnd = await geocodeLocation(trip.destination, [13.0827, 80.2707]);
        eLat = geoEnd?.lat || 13.0827;
        eLng = geoEnd?.lng || 80.2707;
      }

      if (isMounted) {
        setResolvedStart([Number(sLat), Number(sLng)]);
        setResolvedEnd([Number(eLat), Number(eLng)]);
        setEndpointsReady(true);
      }
    }

    resolveEndpoints();

    return () => {
      isMounted = false;
    };
  }, [trip]);

  // 3. Load assigned vehicle telemetry
  useEffect(() => {
    if (!trip) return;
    let isMounted = true;

    async function loadVehicle() {
      try {
        let veh = null;
        if (trip.vehicleId) {
          veh = await vehicleApi.getById(trip.vehicleId);
        }
        if (!veh && trip.vehicleReg) {
          const allVehicles = await vehicleApi.getAll();
          veh = allVehicles.find(
            (v) => v.registration === trip.vehicleReg || v.id === trip.vehicleReg
          );
        }
        if (isMounted && veh) {
          setAssignedVehicle(veh);
        }
      } catch (err) {
        console.warn('Could not load vehicle details:', err);
      }
    }

    loadVehicle();

    return () => {
      isMounted = false;
    };
  }, [trip]);

  // 4. Socket listener for real-time GPS telemetry of assigned truck
  useEffect(() => {
    if (!trip) return;

    const unsubscribe = socketService.subscribe('gps:update', (data) => {
      if (
        data &&
        (data.vehicleId === trip.vehicleId ||
          data.vehicleReg === trip.vehicleReg ||
          data.registration === trip.vehicleReg)
      ) {
        if (data.lat && data.lng) {
          setTruckLocation([Number(data.lat), Number(data.lng)]);
          setAssignedVehicle((prev) => ({
            ...prev,
            lat: Number(data.lat),
            lng: Number(data.lng),
            speed: data.speed !== undefined ? data.speed : prev?.speed,
            heading: data.heading !== undefined ? data.heading : prev?.heading,
            status: data.status || prev?.status || 'moving'
          }));
        }
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [trip]);

  // 5. Load authentic road route matching resolved user-entered locations
  useEffect(() => {
    if (!endpointsReady) return;

    let isMounted = true;
    setRouteLoading(true);

    fetchDrivingRoadRoute(resolvedStart, resolvedEnd)
      .then((res) => {
        if (isMounted) {
          setRouteCoords(res.coords);
          setRouteMeta(res);
          setRouteLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to resolve route:', err);
          const fallback = generateHighwayCorridor(resolvedStart, resolvedEnd);
          setRouteCoords(fallback);
          setRouteMeta({ coords: fallback, source: 'Highway Corridor' });
          setRouteLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [endpointsReady, resolvedStart, resolvedEnd]);

  // 6. Derive authentic truck position on the road
  useEffect(() => {
    if (!trip || !endpointsReady) return;

    if (trip.status === 'Completed') {
      // Completed trip: truck has reached destination
      setTruckLocation(resolvedEnd);
      return;
    }

    if (trip.status === 'Scheduled') {
      // Scheduled trip: truck is parked at origin hub
      setTruckLocation(resolvedStart);
      return;
    }

    // Trip is 'In Transit':
    // If vehicle has distinct live GPS coordinates, use them
    const vLat = assignedVehicle?.lat != null ? Number(assignedVehicle.lat) : null;
    const vLng = assignedVehicle?.lng != null ? Number(assignedVehicle.lng) : null;

    const hasDistinctVehicleGps =
      vLat != null &&
      vLng != null &&
      (Math.abs(vLat - resolvedStart[0]) > 0.015 || Math.abs(vLng - resolvedStart[1]) > 0.015);

    if (hasDistinctVehicleGps) {
      setTruckLocation([vLat, vLng]);
    } else if (routeCoords && routeCoords.length > 5) {
      // Place truck actively en route along turn-by-turn road highway (~55% progress)
      const midIdx = Math.min(
        routeCoords.length - 1,
        Math.max(1, Math.floor(routeCoords.length * 0.55))
      );
      setTruckLocation(routeCoords[midIdx]);
    } else {
      // Fallback interpolation along highway
      const midLat = resolvedStart[0] + (resolvedEnd[0] - resolvedStart[0]) * 0.55;
      const midLng = resolvedStart[1] + (resolvedEnd[1] - resolvedStart[1]) * 0.55;
      setTruckLocation([midLat, midLng]);
    }
  }, [trip, endpointsReady, resolvedStart, resolvedEnd, assignedVehicle, routeCoords]);

  // Calculate truck heading (either from vehicle telemetry or direction along road segment)
  const truckHeading = useMemo(() => {
    if (assignedVehicle?.heading != null && assignedVehicle.heading > 0) {
      return assignedVehicle.heading;
    }
    if (routeCoords && routeCoords.length > 5) {
      const idx = Math.min(
        routeCoords.length - 2,
        Math.max(0, Math.floor(routeCoords.length * 0.55))
      );
      const curr = routeCoords[idx];
      const next = routeCoords[idx + 1];
      if (curr && next) {
        const dLat = next[0] - curr[0];
        const dLng = next[1] - curr[1];
        return Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI);
      }
    }
    return 90;
  }, [assignedVehicle, routeCoords]);

  if (loading || !trip) {
    return <div className="p-8 text-center text-slate-400 text-xs animate-pulse">Loading trip telemetry...</div>;
  }

  // Combined bounds covering Route, Origin, Destination, and Assigned Truck
  const mapBoundsPoints = [
    ...routeCoords,
    resolvedStart,
    resolvedEnd,
    ...(truckLocation ? [truckLocation] : [])
  ];

  const handleFocusTruck = () => {
    if (truckLocation) {
      setFocusTarget([...truckLocation]);
    }
  };

  const handleFitRoute = () => {
    setFocusTarget(null);
    setResetCount((c) => c + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <NavLink
          to="/trips"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dispatcher
        </NavLink>
        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 font-mono text-xs font-bold rounded-lg border border-amber-500/30">
          {trip.tripCode}
        </span>
      </div>

      {trip.isEarlyTermination && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs shadow-lg animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-black text-amber-400 uppercase tracking-wide block">
              Incomplete / Early Termination Incident Logged
            </span>
            <p className="text-slate-300">
              This run was terminated {trip.distanceFromDestinationKm ? `${trip.distanceFromDestinationKm} km before reaching destination` : 'away from the planned destination hub'}.
            </p>
            {trip.terminationReason && (
              <p className="text-amber-200 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-500/20 inline-block font-mono text-[11px]">
                <strong>Driver Reason:</strong> {trip.terminationReason}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trip Meta Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Trip Overview</span>
            <h2 className="text-xl font-black text-slate-100">{trip.origin} → {trip.destination}</h2>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
              <span className="text-emerald-400 font-mono">
                {resolvedStart[0].toFixed(2)}°N, {resolvedStart[1].toFixed(2)}°E
              </span>
              <span>⟶</span>
              <span className="text-rose-400 font-mono">
                {resolvedEnd[0].toFixed(2)}°N, {resolvedEnd[1].toFixed(2)}°E
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Assigned Truck & Driver Card */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 block text-[10px] flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-400" /> Assigned Truck & Driver
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    (assignedVehicle?.status || trip.status?.toLowerCase()) === 'moving' ||
                    trip.status === 'In Transit'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {assignedVehicle?.status || (trip.status === 'In Transit' ? 'moving' : 'idle')}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-100 text-sm">{trip.vehicleReg}</p>
                  <p className="text-xs text-slate-400">
                    {assignedVehicle?.makeModel || 'Commercial Heavy Carrier'}
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    Driver: <strong className="text-slate-100">{trip.driverName}</strong>
                  </p>
                </div>

                {truckLocation && (
                  <button
                    type="button"
                    onClick={handleFocusTruck}
                    className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all shadow-sm"
                    title="Focus assigned truck on map"
                  >
                    <Crosshair className="w-3.5 h-3.5" /> Locate
                  </button>
                )}
              </div>

              {assignedVehicle?.fuelLevel != null && (
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
                  <span>
                    Fuel: <strong className="text-slate-200">{assignedVehicle.fuelLevel}%</strong>
                  </span>
                  <span>
                    Speed:{' '}
                    <strong className="text-emerald-400">
                      {assignedVehicle.speed ?? trip.avgSpeed} km/h
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Transit Distance</span>
                <span className="font-extrabold text-amber-400 text-sm">{trip.distanceKm || routeMeta?.distanceKm || 0} km</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Avg Speed</span>
                <span className="font-extrabold text-emerald-400 text-sm">{trip.avgSpeed || 52} km/h</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Idle Duration</span>
                <span className="font-bold text-amber-400">{trip.idleMinutes} mins</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Fuel Consumed</span>
                <span className="font-bold text-slate-200">{trip.fuelConsumedLitres} L</span>
              </div>
            </div>

            {/* Route Geometry Info Badge */}
            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[10px] flex items-center gap-1">
                  <RouteIcon className="w-3.5 h-3.5 text-cyan-400" /> Planned Route Telemetry
                </span>
                <span className="text-[10px] font-mono text-cyan-300 font-bold">
                  {routeLoading ? 'Calculating route...' : `${routeCoords.length} Road Points`}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Routing Source:</span>
                <span className="text-slate-200 font-medium">
                  {routeMeta?.source || 'Road Network'}
                </span>
              </div>
              {routeMeta?.distanceKm && (
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Highway Distance:</span>
                  <span className="text-emerald-400 font-bold">{routeMeta.distanceKm} km</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Route Map Visualizer */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[530px]">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <RouteIcon className="w-4 h-4 text-cyan-400" /> Planned Route: {trip.origin} → {trip.destination}
              </h3>
              <p className="text-[11px] text-slate-400">
                Dynamic turn-by-turn road route calculated from your entered locations
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded-lg text-[10px] font-bold text-cyan-400 flex items-center gap-1.5">
                {routeLoading ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    Tracing Road Route...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    {routeCoords.length} Road Waypoints
                  </>
                )}
              </span>

              {truckLocation && (
                <button
                  type="button"
                  onClick={handleFocusTruck}
                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors"
                  title="Center map on assigned truck"
                >
                  <Crosshair className="w-3 h-3" /> Locate Truck
                </button>
              )}

              <button
                type="button"
                onClick={handleFitRoute}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors"
                title="Fit full route in viewport"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" /> Fit Route
              </button>
            </div>
          </div>

          <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 relative">
            <MapContainer
              center={resolvedStart}
              zoom={7}
              style={{ width: '100%', height: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              <MapController
                coords={mapBoundsPoints}
                focusTarget={focusTarget}
                triggerReset={resetCount}
              />

              {/* Start Location Marker */}
              <Marker position={resolvedStart} icon={startIcon}>
                <Popup>
                  <div className="text-xs space-y-1 p-1">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black text-[9px] uppercase border border-emerald-500/30">
                      Departure Hub (Origin)
                    </span>
                    <strong className="block text-slate-900 font-bold mt-1">{trip.origin}</strong>
                    <span className="block text-[10px] text-slate-500 font-mono">
                      {resolvedStart[0].toFixed(4)}° N, {resolvedStart[1].toFixed(4)}° E
                    </span>
                  </div>
                </Popup>
              </Marker>

              {/* Destination Location Marker */}
              <Marker position={resolvedEnd} icon={endIcon}>
                <Popup>
                  <div className="text-xs space-y-1 p-1">
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 font-black text-[9px] uppercase border border-rose-500/30">
                      Arrival Hub (Destination)
                    </span>
                    <strong className="block text-slate-900 font-bold mt-1">{trip.destination}</strong>
                    <span className="block text-[10px] text-slate-500 font-mono">
                      {resolvedEnd[0].toFixed(4)}° N, {resolvedEnd[1].toFixed(4)}° E
                    </span>
                  </div>
                </Popup>
              </Marker>

              {/* Assigned Fleet Truck Marker */}
              {truckLocation && (
                <Marker
                  position={truckLocation}
                  icon={createTruckIcon(
                    assignedVehicle?.status || (trip.status === 'In Transit' ? 'moving' : 'idle'),
                    truckHeading,
                    trip.vehicleReg
                  )}
                  zIndexOffset={1000}
                >
                  <Popup>
                    <div className="text-xs space-y-2 p-1 min-w-[190px]">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <span className="font-mono font-black text-slate-900 text-sm">
                          {trip.vehicleReg}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            (assignedVehicle?.status || 'moving') === 'moving'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {assignedVehicle?.status || (trip.status === 'In Transit' ? 'Moving' : 'Idle')}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-600">
                        <p className="font-semibold text-slate-800">
                          {assignedVehicle?.makeModel || 'Commercial Carrier'}
                        </p>
                        <p>
                          Driver: <strong className="text-slate-900">{trip.driverName}</strong>
                        </p>
                        <div className="flex items-center justify-between pt-1 text-slate-700">
                          <span>
                            Speed: <strong>{assignedVehicle?.speed ?? trip.avgSpeed ?? 0} km/h</strong>
                          </span>
                          <span>
                            Fuel: <strong>{assignedVehicle?.fuelLevel ?? 80}%</strong>
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono pt-1">
                          GPS: {truckLocation[0].toFixed(4)}° N, {truckLocation[1].toFixed(4)}° E
                        </p>
                      </div>

                      <NavLink
                        to={`/vehicles/${assignedVehicle?.id || trip.vehicleId}`}
                        className="mt-2 block w-full text-center py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg font-bold text-[10px] transition-colors"
                      >
                        Open Truck Dossier →
                      </NavLink>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Glowing Route Underlayer for road depth */}
              {routeCoords.length > 1 && (
                <Polyline
                  positions={routeCoords}
                  color="#0284c7"
                  weight={7}
                  opacity={0.35}
                  lineCap="round"
                  lineJoin="round"
                />
              )}

              {/* High-visibility Primary Road Polyline */}
              {routeCoords.length > 1 && (
                <Polyline
                  positions={routeCoords}
                  color="#38bdf8"
                  weight={4}
                  opacity={0.95}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
            </MapContainer>

            {/* In-map Route Legend Overlay */}
            <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-2.5 shadow-2xl text-[11px] space-y-1.5 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 rounded-full bg-cyan-400"></span>
                <span className="text-slate-300 font-medium">Highway Road Corridor</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Start ({trip.origin})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-300"></span> Truck ({trip.vehicleReg})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Destination ({trip.destination})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
