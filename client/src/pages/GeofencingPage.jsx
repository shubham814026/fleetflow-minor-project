import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import { Map, Plus, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { geofenceApi } from '../api';

export default function GeofencingPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await geofenceApi.getAll();
        setZones(data);
      } catch (err) {
        console.error('Failed loading geofences', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Map className="w-6 h-6 text-amber-400" /> Geofence Zone Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure permitted logistics corridors & restricted containment boundaries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Active Geofence Zones</h3>
          <div className="space-y-3">
            {zones.map((z) => (
              <div key={z.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">{z.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      z.type === 'Permitted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {z.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Radius: {(z.radius / 1000).toFixed(1)} km</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl h-[480px]">
          <MapContainer center={[15.5000, 75.5000]} zoom={5} style={{ width: '100%', height: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {zones.map((z) => (
              <Circle
                key={z.id}
                center={z.center}
                radius={z.radius}
                pathOptions={{ color: z.color, fillColor: z.color, fillOpacity: 0.25 }}
              >
                <Popup>
                  <div className="text-xs space-y-1">
                    <strong className="text-slate-100">{z.name}</strong>
                    <p>Type: {z.type}</p>
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
