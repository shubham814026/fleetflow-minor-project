import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Map as MapIcon,
  Plus,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  LocateFixed,
  Truck,
  Crosshair,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { geofenceApi, vehicleApi } from '../api';
import gpsService from '../services/gpsService';
import socketService from '../services/socketService';

// Controller to smoothly pan map when driver geofence is anchored
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom || 11, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

// Custom vehicle marker for the driver
const driverVehicleIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute -inset-1 rounded-full bg-emerald-500 opacity-75 animate-ping"></div>
      <div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center shadow-2xl text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
      </div>
    </div>
  `,
  className: 'driver-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

export default function GeofencingPage() {
  const [zones, setZones] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [driverPos, setDriverPos] = useState(null);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const [mapZoom, setMapZoom] = useState(6);
  const [loading, setLoading] = useState(true);
  const [anchoring, setAnchoring] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [recentViolation, setRecentViolation] = useState(null);

  // Form State for creating custom geofence
  const [formData, setFormData] = useState({
    name: '',
    type: 'Permitted',
    radiusKm: 12,
    lat: '',
    lng: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [zonesData, vehData] = await Promise.all([geofenceApi.getAll(), vehicleApi.getAll()]);
      setZones(zonesData || []);
      setVehicles(vehData || []);

      // Check if driver has an active anchored geofence or known location
      const driverZone = zonesData?.find((z) => z.isDriverAnchor || z.id?.startsWith('geo-driver-'));
      if (driverZone && driverZone.center) {
        setMapCenter(driverZone.center);
        setMapZoom(11);
        setDriverPos({ lat: driverZone.center[0], lng: driverZone.center[1] });
      } else {
        const activeVeh = vehData?.find((v) => v.lat != null && v.lng != null);
        if (activeVeh) {
          setMapCenter([activeVeh.lat, activeVeh.lng]);
          setDriverPos({ lat: activeVeh.lat, lng: activeVeh.lng });
        }
      }
    } catch (err) {
      console.error('Failed loading geofences or vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    socketService.connect();
    const unsubViolation = socketService.subscribe('geofence:violation', (violation) => {
      setRecentViolation(violation);
      setTimeout(() => setRecentViolation(null), 10000);
    });

    const unsubGps = socketService.subscribe('gps:update', (gps) => {
      if (gps.lat != null && gps.lng != null) {
        setDriverPos({ lat: gps.lat, lng: gps.lng });
      }
    });

    return () => {
      unsubViolation();
      unsubGps();
    };
  }, []);

  // One-click anchor directly onto Driver's real GPS coordinates
  const handleAnchorToDriverLocation = async () => {
    setAnchoring(true);
    try {
      // 1. Fetch exact physical GPS location from browser/device
      let lat, lng;
      try {
        const pos = await gpsService.getCurrentLocation();
        lat = pos.latitude;
        lng = pos.longitude;
      } catch (gpsErr) {
        // Fallback to active driver vehicle in database
        const activeVeh = vehicles.find((v) => v.lat != null && v.lng != null);
        if (activeVeh) {
          lat = activeVeh.lat;
          lng = activeVeh.lng;
        } else {
          throw new Error('Unable to acquire driver GPS fix: ' + gpsErr.message);
        }
      }

      setDriverPos({ lat, lng });

      // 2. Call backend to anchor geofence around driver GPS
      const anchoredZone = await geofenceApi.anchorDriverGeofence({
        vehicleReg: 'KA-01-EQ-9042',
        driverName: 'Rajesh Kumar',
        lat,
        lng,
        radius: 12000,
        name: 'Driver Live GPS Corridor (KA-01-EQ-9042)',
        type: 'Permitted'
      });

      // 3. Smoothly reposition map center on the newly anchored geofence
      setMapCenter([lat, lng]);
      setMapZoom(11);

      await loadData();
    } catch (err) {
      alert('Error anchoring geofence: ' + err.message);
    } finally {
      setAnchoring(false);
    }
  };

  const handleUseDriverGPSInForm = async () => {
    try {
      let lat, lng;
      if (driverPos) {
        lat = driverPos.lat;
        lng = driverPos.lng;
      } else {
        const pos = await gpsService.getCurrentLocation();
        lat = pos.latitude;
        lng = pos.longitude;
      }
      setFormData((prev) => ({
        ...prev,
        lat: lat.toFixed(5),
        lng: lng.toFixed(5)
      }));
    } catch (err) {
      alert('Could not fetch driver location: ' + err.message);
    }
  };

  const handleCreateGeofence = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.lat || !formData.lng) {
      alert('Please fill out all fields');
      return;
    }

    try {
      const lat = parseFloat(formData.lat);
      const lng = parseFloat(formData.lng);
      const radiusMeters = (parseFloat(formData.radiusKm) || 10) * 1000;

      await geofenceApi.create({
        name: formData.name,
        type: formData.type,
        center: [lat, lng],
        radius: radiusMeters,
        color: formData.type === 'Restricted' ? '#EF4444' : '#10B981'
      });

      setShowCreateModal(false);
      setFormData({ name: '', type: 'Permitted', radiusKm: 12, lat: '', lng: '' });
      setMapCenter([lat, lng]);
      setMapZoom(11);
      await loadData();
    } catch (err) {
      alert('Error creating geofence: ' + err.message);
    }
  };

  const handleDeleteGeofence = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete geofence "${name}"?`)) return;
    try {
      await geofenceApi.delete(id);
      setZones((prev) => prev.filter((z) => z.id !== id));
    } catch (err) {
      alert('Failed to delete geofence: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert on Real-Time Geofence Violation */}
      {recentViolation && (
        <div className="bg-rose-950/80 border-2 border-rose-500 rounded-2xl p-4 flex items-center justify-between shadow-2xl text-rose-200 animate-bounce">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <div>
              <span className="font-black text-sm uppercase tracking-wide">Geofence Violation Detected!</span>
              <p className="text-xs text-rose-300">{recentViolation.reason || `Vehicle ${recentViolation.registration} breached geofence boundary`}</p>
            </div>
          </div>
          <span className="text-[10px] bg-rose-800 px-2 py-1 rounded font-bold font-mono">LIVE BREACH</span>
        </div>
      )}

      {/* Header with Driver GPS Anchoring Action */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <MapIcon className="w-6 h-6 text-amber-400" /> Geofence Zone Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centrally monitor permitted logistics corridors and restricted zones anchored to driver GPS locations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAnchorToDriverLocation}
            disabled={anchoring}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <LocateFixed className={`w-4 h-4 ${anchoring ? 'animate-spin' : ''}`} />
            {anchoring ? 'Anchoring to Driver GPS...' : 'Anchor Geofence to Driver GPS'}
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4 text-amber-400" /> Add Custom Zone
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geofences List Panel */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Active Geofences ({zones.length})
            </h3>
            {driverPos && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Driver GPS Connected
              </span>
            )}
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {zones.map((z) => {
              const isAnchored = z.isDriverAnchor || z.id?.startsWith('geo-driver-');
              return (
                <div
                  key={z.id}
                  className={`p-3.5 bg-slate-950/90 border rounded-xl space-y-2 text-xs transition-all ${
                    isAnchored ? 'border-emerald-500/60 shadow-lg shadow-emerald-500/10' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-100">{z.name}</span>
                        {isAnchored && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase">
                            DRIVER ANCHOR
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        Center: [{z.center?.[0]?.toFixed(4)}, {z.center?.[1]?.toFixed(4)}]
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold shrink-0 ${
                        (z.type || '').toUpperCase() === 'RESTRICTED'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {z.type || 'Permitted'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span>Radius: {(z.radius / 1000).toFixed(1)} km</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setMapCenter(z.center);
                          setMapZoom(11);
                        }}
                        className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Crosshair className="w-3 h-3" /> Focus
                      </button>
                      <button
                        onClick={() => handleDeleteGeofence(z.id, z.name)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Delete Geofence"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaflet Interactive Map Panel */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl h-[520px] flex flex-col">
          <div className="flex items-center justify-between pb-3 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              Live Interactive Map view
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Permitted Corridor
              </span>
              <span className="flex items-center gap-1 text-rose-400 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Restricted Zone
              </span>
            </div>
          </div>

          <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 relative">
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ width: '100%', height: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapController center={mapCenter} zoom={mapZoom} />

              {/* Geofence Circles */}
              {zones.map((z) => (
                <Circle
                  key={z.id}
                  center={z.center}
                  radius={z.radius}
                  pathOptions={{
                    color: z.color || ((z.type || '').toUpperCase() === 'RESTRICTED' ? '#EF4444' : '#10B981'),
                    fillColor: z.color || ((z.type || '').toUpperCase() === 'RESTRICTED' ? '#EF4444' : '#10B981'),
                    fillOpacity: z.isDriverAnchor ? 0.35 : 0.2,
                    weight: z.isDriverAnchor ? 3 : 1.5,
                    dashArray: z.isDriverAnchor ? '6, 6' : undefined
                  }}
                >
                  <Popup>
                    <div className="text-xs space-y-1">
                      <strong className="text-slate-900 font-bold block">{z.name}</strong>
                      <p className="text-slate-700">Type: {z.type}</p>
                      <p className="text-slate-700">Radius: {(z.radius / 1000).toFixed(1)} km</p>
                      {z.isDriverAnchor && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[9px] block">
                          Anchored to Driver GPS
                        </span>
                      )}
                    </div>
                  </Popup>
                </Circle>
              ))}

              {/* Driver Location Marker */}
              {driverPos && (
                <Marker position={[driverPos.lat, driverPos.lng]} icon={driverVehicleIcon}>
                  <Popup>
                    <div className="text-xs space-y-1">
                      <strong className="text-slate-900 font-bold block">Assigned Driver: Rajesh Kumar</strong>
                      <p className="text-slate-700">Vehicle: KA-01-EQ-9042</p>
                      <p className="text-slate-700 font-mono">
                        GPS: {driverPos.lat?.toFixed(5)}, {driverPos.lng?.toFixed(5)}
                      </p>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[9px] block">
                        Live Tracking Connected
                      </span>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Modal: Create Custom Zone */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-left">
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" /> Create Custom Geofence Zone
            </h3>

            <form onSubmit={handleCreateGeofence} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Zone Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Pune Highway Depot"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Zone Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Permitted">Permitted (Safe Corridor)</option>
                    <option value="Restricted">Restricted (No Entry)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Radius (km)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.radiusKm}
                    onChange={(e) => setFormData({ ...formData, radiusKm: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-400 block">Center Coordinates</label>
                  <button
                    type="button"
                    onClick={handleUseDriverGPSInForm}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <LocateFixed className="w-3 h-3" /> Use Driver's Live GPS
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    placeholder="Latitude"
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                  <input
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    placeholder="Longitude"
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black"
                >
                  Save Geofence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

