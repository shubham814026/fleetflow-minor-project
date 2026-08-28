import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import gpsService from '../../services/gpsService';

const driverIcon = L.divIcon({
  html: `<div class="w-8 h-8 rounded-full bg-amber-500 text-slate-950 border-2 border-white flex items-center justify-center font-bold text-xs shadow-xl">YOU</div>`,
  className: 'driver-self-marker',
  iconSize: [32, 32]
});

export default function DriverMapPage() {
  const [coords, setCoords] = useState([12.9716, 77.5946]);

  useEffect(() => {
    gpsService.getCurrentLocation().then((pos) => {
      setCoords([pos.latitude, pos.longitude]);
    }).catch((e) => console.log('Location default fallback'));
  }, []);

  return (
    <div className="h-[calc(100vh-10rem)] rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative">
      <MapContainer center={coords} zoom={13} style={{ width: '100%', height: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={coords} icon={driverIcon}>
          <Popup>Your Live Driver Position</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
