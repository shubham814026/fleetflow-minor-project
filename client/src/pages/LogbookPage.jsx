import React, { useState, useEffect } from 'react';
import { BookOpen, Download, FileSpreadsheet, FileText, Search, RefreshCw, Activity } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { tripApi } from '../api';

export default function LogbookPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  async function loadTrips() {
    setLoading(true);
    try {
      const data = await tripApi.getAll();
      setTrips(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed loading trips for logbook', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrips();
  }, []);

  const filteredTrips = trips.filter((t) => {
    const s = search.toLowerCase();
    const matchesSearch =
      (t.tripCode || '').toLowerCase().includes(s) ||
      (t.driverName || '').toLowerCase().includes(s) ||
      (t.vehicleReg || '').toLowerCase().includes(s) ||
      (t.origin || '').toLowerCase().includes(s) ||
      (t.destination || '').toLowerCase().includes(s);
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('SmartFleet AI - Digital Trip Logbook Ledger', 14, 15);
    const tableData = filteredTrips.map((t) => [
      t.tripCode,
      t.driverName,
      t.vehicleReg,
      t.origin,
      t.destination,
      `${t.distanceKm} km`,
      `${t.durationHours} hrs`,
      t.status
    ]);
    autoTable(doc, {
      startY: 22,
      head: [['Code', 'Driver', 'Vehicle', 'Start', 'End', 'Distance', 'Duration', 'Status']],
      body: tableData
    });
    doc.save('smartfleet_logbook_report.pdf');
  };

  const exportCSV = () => {
    let csv = 'Code,Driver,Vehicle,Start,End,Distance,Duration,Status\n';
    filteredTrips.forEach((t) => {
      csv += `${t.tripCode},${t.driverName},${t.vehicleReg},"${t.origin}","${t.destination}",${t.distanceKm},${t.durationHours},${t.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smartfleet_logbook.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-400" /> Digital Trip Logbook
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time verified trip ledger with distance, route checkpoints, idle time & digital PDF/CSV export
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTrips}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh Logbook"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportPDF}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by trip code, driver name, vehicle, or route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Trip Statuses</option>
            <option value="In Transit">In Transit</option>
            <option value="Completed">Completed</option>
            <option value="Scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Trip Code</th>
                <th className="p-4">Driver</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Origin → Destination</th>
                <th className="p-4">Distance</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <Activity className="w-5 h-5 text-amber-500 animate-spin mx-auto mb-2" />
                    Loading dynamic trip logbook records...
                  </td>
                </tr>
              ) : filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No trips found matching your search.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-400">{t.tripCode}</td>
                    <td className="p-4 font-semibold text-slate-100">{t.driverName}</td>
                    <td className="p-4 text-slate-300 font-mono">{t.vehicleReg}</td>
                    <td className="p-4 text-slate-400">
                      <span className="text-slate-200">{t.origin}</span> → <span>{t.destination}</span>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">{t.distanceKm} km</td>
                    <td className="p-4 text-slate-300">{t.durationHours} hrs</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          t.status === 'In Transit'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : t.status === 'Completed'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
