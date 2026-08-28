import React, { useState } from 'react';
import { BookOpen, Download, FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { INITIAL_TRIPS } from '../api/mockData';

export default function LogbookPage() {
  const [trips] = useState(INITIAL_TRIPS);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('SmartFleet AI - Digital Trip Logbook', 14, 15);
    const tableData = trips.map((t) => [
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
    trips.forEach((t) => {
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
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-400" /> Digital Trip Logbook
          </h1>
          <p className="text-xs text-slate-400 mt-1">Exportable trip ledger with distance, fuel & duration tracking</p>
        </div>

        <div className="flex items-center gap-2">
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

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Trip Code</th>
                <th className="p-4">Driver</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Start Location</th>
                <th className="p-4">End Location</th>
                <th className="p-4">Distance</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {trips.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-amber-400">{t.tripCode}</td>
                  <td className="p-4 font-semibold text-slate-100">{t.driverName}</td>
                  <td className="p-4 text-slate-300">{t.vehicleReg}</td>
                  <td className="p-4 text-slate-400">{t.origin}</td>
                  <td className="p-4 text-slate-400">{t.destination}</td>
                  <td className="p-4 font-bold text-emerald-400">{t.distanceKm} km</td>
                  <td className="p-4 text-slate-300">{t.durationHours} hrs</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
