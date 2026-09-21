import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  MapPin,
  Activity,
  RefreshCw,
  Truck,
  Clock,
  Gauge,
  Fuel,
  CheckCircle2,
  Navigation,
  ArrowRight,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Square,
  AlertTriangle
} from 'lucide-react';
import { tripApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function DriverHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, IN TRANSIT, COMPLETED
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTripId, setExpandedTripId] = useState(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [endingTrip, setEndingTrip] = useState(false);

  const driverName = user?.name || 'Rajesh Kumar';
  const assignedVehicle = user?.assignedVehicleReg || user?.vehicleReg || 'KA-01-EQ-9042';

  async function loadHistory() {
    setLoading(true);
    try {
      // Pass driver identity to fetch only this driver's trips
      const data = await tripApi.getAll({
        driverName: user?.role?.toUpperCase() === 'DRIVER' ? driverName : undefined,
        driverId: user?.id
      });
      const list = Array.isArray(data) ? data : data?.data || [];

      // Strict client-side filter: match current driver only (unless super admin)
      const userIsAdmin = user?.role && (user.role.toLowerCase().includes('admin') || user.role.toLowerCase().includes('manager'));
      const driverTrips = list.filter((t) => {
        if (userIsAdmin) return true;
        const matchesName = t.driverName && user?.name && t.driverName.toLowerCase().includes(user.name.toLowerCase());
        const matchesId = user?.id && t.driverId === user.id;
        return matchesName || matchesId;
      });

      // Synchronize with any locally active trip
      try {
        const saved = localStorage.getItem('fleetflow_active_trip');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.status === 'In Transit') {
            const idx = driverTrips.findIndex((t) => t.id === parsed.id || t.tripCode === parsed.tripCode);
            if (idx >= 0) {
              driverTrips[idx] = { ...driverTrips[idx], ...parsed };
            } else if (
              !user?.name ||
              (parsed.driverName && parsed.driverName.toLowerCase().includes(user.name.toLowerCase()))
            ) {
              driverTrips.unshift(parsed);
            }
          }
        }
      } catch (err) {}

      setTrips(driverTrips);
    } catch (err) {
      console.error('Failed to load driver trip history', err);
    } finally {
      setLoading(false);
    }
  }

  const handleEndActiveTrip = async () => {
    setShowEndModal(false);
    setEndingTrip(true);
    try {
      const targetId = activeTrip?.id || activeTrip?.tripCode || 'trip-active';
      await tripApi.endTrip(targetId, {
        distanceKm: Number(activeTrip?.distanceKm) || 348.5,
        durationHours: Number(activeTrip?.durationHours) || 6.5,
        idleMinutes: 15
      });
      localStorage.removeItem('fleetflow_active_trip');
      localStorage.removeItem('fleetflow_trip_path');
      localStorage.removeItem('fleetflow_driver_geofence');
      await loadHistory();
    } catch (err) {
      console.error('Failed ending trip from history', err);
      localStorage.removeItem('fleetflow_active_trip');
      localStorage.removeItem('fleetflow_trip_path');
      await loadHistory();
    } finally {
      setEndingTrip(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  // Compute dynamic KPIs strictly from the driver's real trips
  const kpis = useMemo(() => {
    const totalCount = trips.length;
    const inTransitCount = trips.filter((t) => t.status === 'In Transit').length;
    const completedCount = trips.filter((t) => t.status === 'Completed').length;
    const totalKm = trips.reduce((sum, t) => sum + (Number(t.distanceKm) || 0), 0);
    const totalHours = trips.reduce((sum, t) => sum + (Number(t.durationHours) || 0), 0);
    const totalFuel = trips.reduce((sum, t) => sum + (Number(t.fuelConsumedLitres) || 0), 0);

    return {
      totalCount,
      inTransitCount,
      completedCount,
      totalKm: totalKm.toFixed(1),
      totalHours: totalHours.toFixed(1),
      totalFuel: totalFuel.toFixed(1)
    };
  }, [trips]);

  // Active in-transit trip for Rajesh Kumar
  const activeTrip = useMemo(() => {
    return trips.find((t) => t.status === 'In Transit');
  }, [trips]);

  // Filter and search application
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const matchStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'IN TRANSIT' && t.status === 'In Transit') ||
        (filterStatus === 'COMPLETED' && t.status === 'Completed');

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.tripCode?.toLowerCase().includes(q) ||
        t.origin?.toLowerCase().includes(q) ||
        t.destination?.toLowerCase().includes(q) ||
        t.vehicleReg?.toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [trips, filterStatus, searchQuery]);

  const toggleExpand = (id) => {
    setExpandedTripId((prev) => (prev === id ? null : id));
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'In Progress';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
                Driver Trip History
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified logs for <span className="text-amber-400 font-semibold">{driverName}</span> • Vehicle <span className="text-slate-200 font-semibold">{assignedVehicle}</span>
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={loadHistory}
          disabled={loading}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl border border-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
          title="Refresh trip history"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Dynamic KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Driven</span>
          <div className="text-lg font-black text-slate-100 mt-0.5 flex items-baseline gap-1">
            {kpis.totalKm} <span className="text-xs text-slate-400 font-normal">km</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">{kpis.totalCount} total runs logged</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">In Transit</span>
          <div className="text-lg font-black text-emerald-400 mt-0.5 flex items-baseline gap-1">
            {kpis.inTransitCount} <span className="text-xs text-emerald-500/70 font-normal">active</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Live on road now</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Completed</span>
          <div className="text-lg font-black text-blue-400 mt-0.5 flex items-baseline gap-1">
            {kpis.completedCount} <span className="text-xs text-blue-500/70 font-normal">delivered</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Successful drop-offs</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Duty Hours</span>
          <div className="text-lg font-black text-amber-400 mt-0.5 flex items-baseline gap-1">
            {kpis.totalHours} <span className="text-xs text-amber-500/70 font-normal">hrs</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">{kpis.totalFuel} L fuel recorded</span>
        </div>
      </div>

      {/* Highlight Active Trip if In Transit */}
      {activeTrip && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 p-4 rounded-2xl shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black text-emerald-400 tracking-wide uppercase">
                Active Transit in Progress
              </span>
              <span className="font-mono text-xs font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {activeTrip.tripCode}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEndModal(true)}
                disabled={endingTrip}
                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>{endingTrip ? 'Finalizing...' : 'End Run'}</span>
              </button>
              <button
                onClick={() => navigate('/driver/trip')}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-950"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Resume Active Trip</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-200 font-semibold flex items-center gap-2">
            <span className="text-slate-300">{activeTrip.origin}</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-emerald-300">{activeTrip.destination}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span>Distance: <strong className="text-slate-200">{activeTrip.distanceKm} km</strong></span>
            <span>Est. Time: <strong className="text-slate-200">{activeTrip.durationHours} hrs</strong></span>
            <span>Vehicle: <strong className="text-slate-200">{activeTrip.vehicleReg}</strong></span>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filterStatus === 'ALL'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All <span className="text-[10px] px-1.5 py-0.2 bg-slate-700/60 rounded-full">{kpis.totalCount}</span>
          </button>
          <button
            onClick={() => setFilterStatus('IN TRANSIT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filterStatus === 'IN TRANSIT'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            In Transit <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950/60 rounded-full">{kpis.inTransitCount}</span>
          </button>
          <button
            onClick={() => setFilterStatus('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filterStatus === 'COMPLETED'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-blue-300'
            }`}
          >
            Completed <span className="text-[10px] px-1.5 py-0.2 bg-blue-950/60 rounded-full">{kpis.completedCount}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search code, city, vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-slate-900/60 rounded-2xl border border-slate-800">
            <Activity className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-3" />
            Synchronizing live driver trip history...
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
            <AlertCircle className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="font-semibold text-slate-300">No trip records found</p>
            <p className="text-[11px] text-slate-500">
              {searchQuery
                ? `No trips match "${searchQuery}". Try clearing search.`
                : `No ${filterStatus !== 'ALL' ? filterStatus.toLowerCase() : ''} trips found for ${driverName}.`}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          filteredTrips.map((t) => {
            const isExpanded = expandedTripId === t.id;
            const isInTransit = t.status === 'In Transit';

            return (
              <div
                key={t.id}
                className={`bg-slate-900 border rounded-2xl shadow-lg transition-all ${
                  isInTransit
                    ? 'border-emerald-500/30 hover:border-emerald-500/50 bg-gradient-to-b from-slate-900 to-slate-900/90'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Card Main Header */}
                <div
                  onClick={() => toggleExpand(t.id)}
                  className="p-4 cursor-pointer select-none space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-amber-400 text-xs tracking-wide">
                        {t.tripCode}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        • {t.vehicleReg}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1.5 ${
                          isInTransit
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {isInTransit ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            IN TRANSIT
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            COMPLETED
                          </>
                        )}
                      </span>
                      <button className="text-slate-400 hover:text-slate-200 p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Route Display */}
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span>{t.origin}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{t.destination}</span>
                    </div>
                  </div>

                  {/* Quick Stat Pills */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span><strong className="text-slate-200">{t.distanceKm}</strong> km</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span><strong className="text-slate-200">{t.durationHours}</strong> hrs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-slate-500" />
                      <span><strong className="text-slate-200">{t.avgSpeed || 48}</strong> km/h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="w-3 h-3 text-slate-500" />
                      <span><strong className="text-slate-200">{t.fuelConsumedLitres || '--'}</strong> L</span>
                    </div>
                  </div>
                </div>

                {/* Expandable Details Drawer */}
                {isExpanded && (
                  <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 rounded-b-2xl space-y-3 text-xs animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Departure Log</span>
                        <p className="font-semibold text-slate-200">{formatDate(t.startTime)}</p>
                        <p className="text-[11px] text-slate-400">{t.startLocation?.address || t.origin}</p>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Arrival Log</span>
                        <p className="font-semibold text-slate-200">
                          {t.endTime ? formatDate(t.endTime) : (
                            <span className="text-emerald-400 font-bold">Estimated Arrival Active</span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400">{t.endLocation?.address || t.destination}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                      <div className="flex items-center gap-3 text-slate-400">
                        <span>Idle Time: <strong className="text-slate-200">{t.idleMinutes || 0} min</strong></span>
                        <span>Driver: <strong className="text-amber-400">{t.driverName}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isInTransit ? (
                          <button
                            onClick={() => navigate('/driver/trip')}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Navigate Active Run</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate('/driver/map')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1 transition border border-slate-700"
                          >
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            <span>View on Live Map</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* In-App Confirm End Modal */}
      {showEndModal && activeTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" /> End Trip {activeTrip.tripCode}?
            </h3>
            <p className="text-xs text-slate-400">
              This will complete the run from <strong className="text-slate-200">{activeTrip.origin}</strong> to <strong className="text-slate-200">{activeTrip.destination}</strong> and commit verified mileage to your historical ledger.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEndActiveTrip}
                disabled={endingTrip}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                {endingTrip ? 'Finalizing...' : 'Confirm End Trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
