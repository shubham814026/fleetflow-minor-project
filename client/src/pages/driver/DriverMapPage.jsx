import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Navigation,
  LocateFixed,
  Compass,
  MapPin,
  ShieldCheck,
  Radio,
  Layers,
  Activity,
  CheckCircle2,
  RefreshCw,
  Crosshair
} from 'lucide-react';
import gpsService from '../../services/gpsService';
import { geofenceApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

// Dynamic Driver Avatar Marker
const createDriverIcon = (heading = 0) =>
  L.divIcon({
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: rgba(245, 158, 11, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 36px; height: 36px; border-radius: 9999px; background: linear-gradient(135deg, #f59e0b, #d97706); border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); transform: rotate(${heading}deg); transition: transform 0.4s ease;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
      </div>
    `,
    className: 'driver-live-beacon',
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });

// Helper component that dynamically flies to driver coords whenever they update
function FlyToLocation({ coords, zoom, autoFollow }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1] && autoFollow) {
      map.flyTo(coords, zoom || 15, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [coords, zoom, autoFollow, map]);
  return null;
}

export default function DriverMapPage() {
  const { user } = useAuth();
  const [coords, setCoords] = useState(null);
  const [locationMeta, setLocationMeta] = useState({
    accuracy: 10,
    speed: 0,
    heading: 0,
    source: 'Acquiring GPS...',
    address: 'Resolving real location...',
    city: '',
    state: ''
  });
  const [anchoredGeofence, setAnchoredGeofence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoFollow, setAutoFollow] = useState(true);
  const [mapTheme, setMapTheme] = useState('street');
  const [notification, setNotification] = useState(null);
  const watchIdRef = useRef(null);

  // Load existing geofence if any
  useEffect(() => {
    try {
      const savedGeo = localStorage.getItem('fleetflow_driver_geofence');
      if (savedGeo) setAnchoredGeofence(JSON.parse(savedGeo));
    } catch (e) {}
  }, []);

  // Fetch initial location and start continuous watch
  const acquireLocation = async () => {
    setLoading(true);
    try {
      const pos = await gpsService.getCurrentLocation();
      const newCoords = [pos.latitude, pos.longitude];
      setCoords(newCoords);

      setLocationMeta(prev => ({
        ...prev,
        accuracy: pos.accuracy || 15,
        speed: pos.speed || 0,
        heading: pos.heading || 0,
        source: pos.source || 'High-Accuracy Device GPS'
      }));

      // Reverse geocode to get real street address
      gpsService.reverseGeocode(pos.latitude, pos.longitude).then(addr => {
        if (addr) {
          setLocationMeta(prev => ({
            ...prev,
            address: addr.displayName || `${addr.road}, ${addr.city}`,
            city: addr.city,
            state: addr.state
          }));
        }
      });
    } catch (err) {
      console.warn('GPS initial error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    acquireLocation();

    // Start continuous hardware GPS watching
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newCoords = [position.coords.latitude, position.coords.longitude];
          setCoords(newCoords);
          setLocationMeta(prev => ({
            ...prev,
            accuracy: Math.round(position.coords.accuracy || 8),
            speed: position.coords.speed ? Math.round(position.coords.speed * 3.6) : prev.speed,
            heading: position.coords.heading || prev.heading,
            source: 'High-Accuracy Device GPS (Live)'
          }));
        },
        (error) => {
          console.warn('Geolocation watch notice:', error.message);
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      );
    }

    return () => {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleRecenter = () => {
    setAutoFollow(true);
    acquireLocation();
    setNotification('Re-centered on live GPS position');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAnchorGeofence = async () => {
    if (!coords) return;
    try {
      const driverName = user?.name || 'Rajesh Kumar';
      const vehicleReg = user?.assignedVehicleReg || user?.vehicleReg || 'KA-01-EQ-9042';

      const geo = await geofenceApi.anchorDriverGeofence({
        vehicleReg,
        driverName,
        lat: coords[0],
        lng: coords[1],
        radius: 10000,
        name: `Driver Live Corridor (${vehicleReg})`,
        type: 'Permitted'
      });

      setAnchoredGeofence(geo);
      localStorage.setItem('fleetflow_driver_geofence', JSON.stringify(geo));
      setNotification(`Geofence anchored directly to your coordinates: [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}]`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification('Failed to anchor geofence: ' + err.message);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const currentCenter = coords || [19.0760, 72.8777];

  return (
    <div className="space-y-4 text-left">
      {/* Top Telemetry Notification Banner */}
      {notification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {notification}
          </span>
        </div>
      )}

      {/* Main Map Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative h-[calc(100vh-14rem)] min-h-[480px]">
        {/* Floating Quick Action Overlay */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <button
            onClick={handleRecenter}
            className="p-3 bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-slate-700/80 rounded-xl shadow-xl backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold"
            title="Recenter Map on Live Location"
          >
            <Crosshair className="w-4 h-4" />
            <span className="hidden sm:inline">Locate Me</span>
          </button>

          <button
            onClick={handleAnchorGeofence}
            className="p-3 bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-slate-700/80 rounded-xl shadow-xl backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold"
            title="Anchor Dynamic Geofence Here"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Anchor Geofence</span>
          </button>

          <button
            onClick={() =>
              setMapTheme(prev =>
                prev === 'street' ? 'dark' : prev === 'dark' ? 'satellite' : 'street'
              )
            }
            className="p-3 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl shadow-xl backdrop-blur-md transition-all text-xs font-bold flex items-center gap-1.5"
            title="Switch Map Tiles (100% Free - No API Key Needed)"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">
              {mapTheme === 'street' ? 'Street View' : mapTheme === 'dark' ? 'Dark Canvas' : 'Satellite View'}
            </span>
          </button>
        </div>

        {/* Floating Live GPS Source Badge */}
        <div className="absolute top-4 left-4 z-[1000] bg-slate-950/90 border border-slate-700/80 px-3.5 py-2 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <div>
            <span className="font-bold text-slate-100 block text-[11px]">{locationMeta.source}</span>
            <span className="text-[10px] text-slate-400 font-mono">Accuracy: ±{locationMeta.accuracy}m</span>
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <MapContainer
          center={currentCenter}
          zoom={15}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          <FlyToLocation coords={coords} zoom={15} autoFollow={autoFollow} />

          <TileLayer
            url={
              mapTheme === 'dark'
                ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
                : mapTheme === 'satellite'
                ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://www.esri.com/">Esri</a>'
          />

          {coords && (
            <>
              {/* Accuracy Radius Circle */}
              <Circle
                center={coords}
                radius={Math.min(locationMeta.accuracy * 1.5, 300)}
                pathOptions={{
                  fillColor: '#f59e0b',
                  fillOpacity: 0.15,
                  color: '#f59e0b',
                  weight: 1,
                  dashArray: '4, 4'
                }}
              />

              {/* Anchored Geofence Circle if active */}
              {anchoredGeofence && (
                <Circle
                  center={[anchoredGeofence.lat || coords[0], anchoredGeofence.lng || coords[1]]}
                  radius={anchoredGeofence.radius || 10000}
                  pathOptions={{
                    fillColor: '#10b981',
                    fillOpacity: 0.08,
                    color: '#10b981',
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="text-xs space-y-1 p-1">
                      <strong className="text-emerald-600 block">Authorized Geofence Corridor</strong>
                      <span>Radius: {((anchoredGeofence.radius || 10000) / 1000).toFixed(1)} km</span>
                    </div>
                  </Popup>
                </Circle>
              )}

              {/* Driver Live Marker */}
              <Marker position={coords} icon={createDriverIcon(locationMeta.heading)}>
                <Popup>
                  <div className="p-2 text-xs space-y-1.5 font-sans">
                    <strong className="text-amber-500 font-bold block text-sm">
                      {user?.name || 'Assigned Driver'}
                    </strong>
                    <div className="text-slate-600">
                      Vehicle: <strong className="text-slate-900 font-mono">{user?.assignedVehicleReg || user?.vehicleReg || 'KA-01-EQ-9042'}</strong>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {coords[0].toFixed(5)}°N, {coords[1].toFixed(5)}°E
                    </div>
                    <div className="text-slate-700 font-medium border-t border-slate-200 pt-1">
                      {locationMeta.address}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      </div>

      {/* Real-Time Telemetry & Address Footer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-500 block font-semibold">Live Coordinates</span>
          <span className="font-mono font-bold text-amber-400 text-xs">
            {coords ? `${coords[0].toFixed(4)}°N, ${coords[1].toFixed(4)}°E` : 'Acquiring...'}
          </span>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-500 block font-semibold">Speed (GPS Telemetry)</span>
          <span className="font-mono font-bold text-slate-100 text-xs flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            {locationMeta.speed} km/h
          </span>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-500 block font-semibold">Compass Heading</span>
          <span className="font-mono font-bold text-cyan-400 text-xs flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" />
            {locationMeta.heading}° Bearing
          </span>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-500 block font-semibold">Geofence Status</span>
          <span className="font-bold text-emerald-400 text-xs flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {anchoredGeofence ? 'Corridor Locked' : 'Normal Telemetry'}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-slate-500 block font-semibold">Live Physical Address (Reverse Geocoded)</span>
            <p className="text-slate-200 text-xs font-medium leading-relaxed">
              {locationMeta.address}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
