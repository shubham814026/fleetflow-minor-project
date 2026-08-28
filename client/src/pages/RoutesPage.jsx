import React, { useState } from 'react';
import { Navigation, MapPin, Search, ArrowRight } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';

export default function RoutesPage() {
  const [origin, setOrigin] = useState('Bengaluru ICD Nelamangala');
  const [destination, setDestination] = useState('Chennai Port Container Terminal');
  const [vehicle, setVehicle] = useState('KA-01-EQ-9042');
  const [calculated, setCalculated] = useState(true);

  const startCoords = [12.9716, 77.5946];
  const endCoords = [13.0827, 80.2707];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <Navigation className="w-6 h-6 text-amber-400" /> Route Optimisation & Dispatch Planner
        </h1>
        <p className="text-xs text-slate-400 mt-1">OSRM mapping integration for minimum distance & fuel efficient route calculation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={(e) => { e.preventDefault(); setCalculated(true); }} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Route Parameters</h3>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Origin Location</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Destination Location</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Vehicle Assignment</label>
            <input
              type="text"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            Calculate Optimal Route
          </button>
        </form>

        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl h-[480px]">
          <MapContainer center={startCoords} zoom={7} style={{ width: '100%', height: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={startCoords}><Popup>Origin: {origin}</Popup></Marker>
            <Marker position={endCoords}><Popup>Destination: {destination}</Popup></Marker>
            <Polyline positions={[startCoords, endCoords]} color="#3b82f6" weight={5} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
