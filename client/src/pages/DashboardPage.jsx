import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Truck,
  Users,
  Waypoints,
  Fuel,
  AlertTriangle,
  WifiOff,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  MapPin
} from 'lucide-react';
import { vehicleApi, driverApi, tripApi, alertApi, fuelApi, forecastApi } from '../api';
import socketService from '../services/socketService';

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [fuelMetrics, setFuelMetrics] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [vData, dData, tData, aData, fData, fcData] = await Promise.all([
          vehicleApi.getAll(),
          driverApi.getAll(),
          tripApi.getAll(),
          alertApi.getAll(),
          fuelApi.getMetrics(),
          forecastApi.getDemand()
        ]);

        setVehicles(vData);
        setDrivers(dData);
        setTrips(tData);
        setAlerts(aData);
        setFuelMetrics(fData);
        setForecast(fcData);
      } catch (err) {
        console.error('Failed loading dashboard data', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();

    // Socket real-time subscriptions
    socketService.connect();
    const unsubGps = socketService.subscribe('gps:update', (data) => {
      setVehicles((prev) =>
        prev.map((v) => (v.id === data.vehicleId ? { ...v, lat: data.lat, lng: data.lng, speed: data.speed } : v))
      );
    });

    const unsubAlert = socketService.subscribe('alert:new', (newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
    });

    return () => {
      unsubGps();
      unsubAlert();
    };
  }, []);

  const activeVehicles = vehicles.filter((v) => v.status === 'moving' || v.status === 'idle').length;
  const offlineVehicles = vehicles.filter((v) => v.status === 'offline').length;
  const activeDrivers = drivers.filter((d) => d.status === 'Active').length;
  const openAlerts = alerts.filter((a) => a.status === 'Open').length;

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm animate-pulse flex flex-col items-center gap-3">
        <Activity className="w-8 h-8 text-amber-500 animate-spin" />
        <span>Initializing SmartFleet AI Telemetry Engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div>
          <h1 className="text-xl font-black text-slate-100 tracking-tight">Fleet Command Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time telemetry, driver stats, fuel intelligence & alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <NavLink
            to="/live-map"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <MapPin className="w-4 h-4" /> Open Fullscreen Live Map
          </NavLink>
        </div>
      </div>

      {/* 8 Required KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Active Vehicles</span>
            <span className="text-xl font-black text-slate-100">{activeVehicles}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Total Vehicles</span>
            <span className="text-xl font-black text-slate-100">{vehicles.length}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
            <Waypoints className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Trips Today</span>
            <span className="text-xl font-black text-slate-100">{trips.length}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Active Drivers</span>
            <span className="text-xl font-black text-slate-100">{activeDrivers}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Fuel Cost This Month</span>
            <span className="text-xl font-black text-slate-100">
              ₹ {fuelMetrics?.totalSpentThisMonth ? (fuelMetrics.totalSpentThisMonth / 1000).toFixed(1) + 'k' : '485k'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Open Alerts</span>
            <span className="text-xl font-black text-slate-100">{openAlerts}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400">
            <WifiOff className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Vehicles Offline</span>
            <span className="text-xl font-black text-slate-100">{offlineVehicles}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Forecasted Demand</span>
            <span className="text-xl font-black text-slate-100">{forecast?.nextWeekDemandTrips || 184} trips</span>
          </div>
        </div>
      </div>

      {/* Grid Section: Live Fleet Status & Open Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicles Telemetry Summary */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" /> Active Vehicles Live Telemetry
            </h3>
            <NavLink to="/vehicles" className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="space-y-3">
            {vehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      v.status === 'moving'
                        ? 'bg-emerald-500 animate-pulse'
                        : v.status === 'sos'
                        ? 'bg-rose-500 animate-ping'
                        : v.status === 'idle'
                        ? 'bg-amber-500'
                        : 'bg-slate-600'
                    }`}
                  />
                  <div>
                    <span className="font-bold text-slate-100 block">{v.registration}</span>
                    <span className="text-[11px] text-slate-400">{v.makeModel}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-medium text-slate-300 block">{v.assignedDriverName || 'Unassigned'}</span>
                  <span className="text-[11px] text-slate-400">{v.speed} km/h • Fuel: {v.fuelLevel}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts Feed */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> Recent Alerts
            </h3>
            <NavLink to="/alerts" className="text-xs text-rose-400 hover:underline font-semibold">
              Manage
            </NavLink>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 4).map((alt) => (
              <div key={alt.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      alt.severity === 'Critical'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {alt.category} • {alt.severity}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(alt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-300 font-medium line-clamp-2">{alt.description}</p>
                <div className="text-[11px] text-slate-400 pt-1">
                  Vehicle: <span className="text-slate-200 font-semibold">{alt.vehicleReg}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
