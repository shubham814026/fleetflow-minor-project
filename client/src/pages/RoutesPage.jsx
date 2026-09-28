import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Search, ArrowRight, Gauge, Fuel, Clock, Activity } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { vehicleApi, routeApi } from '../api';

export default function RoutesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [origin, setOrigin] = useState('Bengaluru ICD Nelamangala');
  const [destination, setDestination] = useState('Chennai Port Container Terminal');
  const [selectedVehicleReg, setSelectedVehicleReg] = useState('');
  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState({
    distanceKm: 348.5,
    estimatedDurationHours: 5.8,
    recommendedSpeedKmh: 60,
    fuelEstimateLitres: 92,
    tollCount: 4,
    waypoints: [
      [12.9716, 77.5946],
      [12.9850, 78.2000],
      [12.9200, 79.1300],
      [13.0827, 80.2707]
    ]
  });

  useEffect(() => {
    async function loadVehicles() {
      try {
        const v = await vehicleApi.getAll();
        const list = Array.isArray(v) ? v : [];
        setVehicles(list);
        if (list.length > 0) {
          setSelectedVehicleReg(list[0].registration);
        }
      } catch (e) {
        console.error('Failed to load vehicles for routes', e);
      }
    }
    loadVehicles();
  }, []);

  const handleCalculateRoute = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await routeApi.optimize({
        origin,
        destination,
        vehicleReg: selectedVehicleReg
      });
      const data = res.data || res;
      setRouteResult(data);
    } catch (err) {
      console.error('Error calculating route', err);
    } finally {
      setLoading(false);
    }
  };

  const waypoints = routeResult.waypoints || [
    [12.9716, 77.5946],
    [13.0827, 80.2707]
  ];
  const startCoords = waypoints[0] || [12.9716, 77.5946];
  const endCoords = waypoints[waypoints.length - 1] || [13.0827, 80.2707];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <Navigation className="w-6 h-6 text-amber-400" /> Route Optimisation & Dispatch Planner
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Dynamic OSRM waypoint calculation for minimum highway distance & optimized fuel efficiency
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Planner Form */}
        <form onSubmit={handleCalculateRoute} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
            Trip Route Parameters
          </h3>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Origin Logistics Hub</label>
            <input
              type="text"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Destination Location</label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Assign Fleet Vehicle</label>
            <select
              value={selectedVehicleReg}
              onChange={(e) => setSelectedVehicleReg(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.registration}>
                  {v.registration} — {v.makeModel} ({v.status})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            {loading ? 'Optimizing Corridor...' : 'Calculate Optimal Route'}
          </button>

          {/* Route Metrics Preview */}
          <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Highway Distance:</span>
              <strong className="text-emerald-400 font-bold">{routeResult.distanceKm} km</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Est. Transit Time:</span>
              <strong className="text-slate-200 font-bold">{routeResult.estimatedDurationHours} hours</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Fuel Requirement:</span>
              <strong className="text-amber-400 font-bold">{routeResult.fuelEstimateLitres} Litres</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Recommended Speed:</span>
              <strong className="text-cyan-400 font-bold">{routeResult.recommendedSpeedKmh} km/h</strong>
            </div>
          </div>
        </form>

        {/* Dynamic Route Map */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl h-[480px]">
          <MapContainer center={startCoords} zoom={7} style={{ width: '100%', height: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={startCoords}>
              <Popup>
                <div className="text-xs">
                  <strong className="text-emerald-400">ORIGIN:</strong>
                  <p>{origin}</p>
                </div>
              </Popup>
            </Marker>
            <Marker position={endCoords}>
              <Popup>
                <div className="text-xs">
                  <strong className="text-rose-400">DESTINATION:</strong>
                  <p>{destination}</p>
                </div>
              </Popup>
            </Marker>
            <Polyline positions={waypoints} color="#f59e0b" weight={4} opacity={0.85} dashArray="6, 8" />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
