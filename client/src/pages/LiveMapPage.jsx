import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Truck,
  Filter,
  RefreshCcw,
  Compass,
  AlertTriangle,
  Radio,
  Search,
  Maximize2,
  Navigation
} from 'lucide-react';
import { vehicleApi } from '../api';
import socketService from '../services/socketService';

// Custom Leaflet DivIcon generator for dynamic status colors
function createVehicleIcon(status, heading = 0) {
  let colorClass = 'bg-emerald-500 text-slate-950 border-emerald-300';
  let animateClass = '';

  if (status === 'sos') {
    colorClass = 'bg-rose-600 text-white border-rose-300';
    animateClass = 'animate-ping';
  } else if (status === 'geofence_violation') {
    colorClass = 'bg-purple-600 text-white border-purple-300';
    animateClass = 'animate-bounce';
  } else if (status === 'idle') {
    colorClass = 'bg-amber-500 text-slate-950 border-amber-300';
  } else if (status === 'offline') {
    colorClass = 'bg-slate-600 text-slate-200 border-slate-400';
  }

  const html = `
    <div class="relative flex items-center justify-center">
      ${animateClass ? `<div class="absolute inset-0 rounded-full ${colorClass} opacity-75 ${animateClass}"></div>` : ''}
      <div class="w-9 h-9 rounded-full ${colorClass} border-2 flex items-center justify-center shadow-xl font-bold transition-transform transform" style="transform: rotate(${heading}deg);">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-vehicle-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
}

// Controller component to programmatically recenter map
function MapRecenter({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export default function LiveMapPage() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const data = await vehicleApi.getAll();
        setVehicles(data);
      } catch (err) {
        console.error('Error fetching live map vehicles', err);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();

    // Socket updates
    socketService.connect();
    const unsubGps = socketService.subscribe('gps:update', (update) => {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === update.vehicleId
            ? { ...v, lat: update.lat, lng: update.lng, speed: update.speed, heading: update.heading }
            : v
        )
      );
    });

    return () => unsubGps();
  }, []);

  const filteredVehicles = vehicles.filter((v) => {
    const matchesStatus = statusFilter === 'ALL' || v.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesQuery =
      v.registration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesQuery;
  });

  const bounds = filteredVehicles.map((v) => [v.lat, v.lng]);

  return (
    <div className="space-y-4 h-[calc(100vh-6rem)] flex flex-col">
      {/* Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search vehicle reg or driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Statuses ({vehicles.length})</option>
              <option value="moving">Moving</option>
              <option value="idle">Idle</option>
              <option value="offline">Offline</option>
              <option value="sos">SOS Critical</option>
              <option value="geofence_violation">Geofence Violation</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVehicles([...vehicles])}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Refresh GPS feeds"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Map + Detail Drawer Layout */}
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <MapContainer
          center={[18.5204, 73.8567]}
          zoom={5}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {bounds.length > 0 && <MapRecenter bounds={bounds} />}

          {filteredVehicles.map((veh) => (
            <Marker
              key={veh.id}
              position={[veh.lat, veh.lng]}
              icon={createVehicleIcon(veh.status, veh.heading)}
              eventHandlers={{
                click: () => setSelectedVehicle(veh)
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
                    <span className="font-extrabold text-xs text-amber-400">{veh.registration}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                        veh.status === 'moving'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : veh.status === 'sos'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {veh.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-300">
                    <p>
                      Driver: <strong className="text-slate-100">{veh.assignedDriverName || 'Unassigned'}</strong>
                    </p>
                    <p>
                      Speed: <strong className="text-emerald-400">{veh.speed} km/h</strong>
                    </p>
                    <p>
                      Heading: <strong>{veh.heading}°</strong>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Updated: {new Date(veh.lastGpsUpdate).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Selected Vehicle Floating Overlay */}
        {selectedVehicle && (
          <div className="absolute bottom-4 left-4 z-20 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 max-w-sm w-full shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="font-black text-sm text-slate-100">{selectedVehicle.registration}</h4>
                  <span className="text-[10px] text-slate-400">{selectedVehicle.makeModel}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="text-xs text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Driver</span>
                <span className="font-bold text-slate-200">{selectedVehicle.assignedDriverName}</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Speed & Fuel</span>
                <span className="font-bold text-emerald-400">{selectedVehicle.speed} km/h</span> • {selectedVehicle.fuelLevel}%
              </div>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                Coordinates: {selectedVehicle.lat.toFixed(4)}, {selectedVehicle.lng.toFixed(4)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
