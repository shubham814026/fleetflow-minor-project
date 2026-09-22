import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Waypoints, ArrowLeft, Clock, MapPin, Fuel, Gauge, ShieldCheck, AlertTriangle } from 'lucide-react';
import { tripApi } from '../api';

const startIcon = L.divIcon({
  html: `<div class="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-[10px] shadow-lg border-2 border-white">S</div>`,
  className: 'custom-start-marker',
  iconSize: [24, 24]
});

const endIcon = L.divIcon({
  html: `<div class="w-6 h-6 rounded-full bg-rose-600 text-white font-black flex items-center justify-center text-[10px] shadow-lg border-2 border-white">E</div>`,
  className: 'custom-end-marker',
  iconSize: [24, 24]
});

export default function TripDetailPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading || !trip) {
    return <div className="p-8 text-center text-slate-400 text-xs animate-pulse">Loading trip telemetry...</div>;
  }

  const startCoords = [trip.startLocation?.lat || 12.9716, trip.startLocation?.lng || 77.5946];
  const endCoords = [trip.endLocation?.lat || 13.0827, trip.endLocation?.lng || 80.2707];
  const polyline = [startCoords, endCoords];

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
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block text-[10px]">Vehicle & Driver</span>
              <p className="font-bold text-slate-100">{trip.vehicleReg}</p>
              <p className="text-slate-400">{trip.driverName}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Distance</span>
                <span className="font-extrabold text-amber-400 text-sm">{trip.distanceKm} km</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Avg Speed</span>
                <span className="font-extrabold text-emerald-400 text-sm">{trip.avgSpeed} km/h</span>
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
          </div>
        </div>

        {/* Route Map Visualizer */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[480px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" /> Recorded GPS Route Polyline
            </h3>
            <span className="text-[10px] text-slate-400">Start to Destination Polyline</span>
          </div>

          <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 relative">
            <MapContainer center={startCoords} zoom={7} style={{ width: '100%', height: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={startCoords} icon={startIcon}>
                <Popup>Origin: {trip.origin}</Popup>
              </Marker>
              <Marker position={endCoords} icon={endIcon}>
                <Popup>Destination: {trip.destination}</Popup>
              </Marker>
              <Polyline positions={polyline} color="#f59e0b" weight={4} dashArray="5, 10" />
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
