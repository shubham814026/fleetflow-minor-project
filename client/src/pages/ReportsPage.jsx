import React, { useState } from 'react';
import { FileBarChart, Download, FileText, FileSpreadsheet, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { INITIAL_VEHICLES, INITIAL_DRIVERS, INITIAL_TRIPS } from '../api/mockData';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('Trip Report');

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`SmartFleet AI - ${reportType}`, 14, 15);

    if (reportType === 'Trip Report') {
      const data = INITIAL_TRIPS.map((t) => [t.tripCode, t.driverName, t.vehicleReg, `${t.distanceKm} km`, t.status]);
      autoTable(doc, { startY: 22, head: [['Code', 'Driver', 'Vehicle', 'Distance', 'Status']], body: data });
    } else if (reportType === 'Vehicle Report') {
      const data = INITIAL_VEHICLES.map((v) => [v.registration, v.makeModel, v.type, `${v.fuelLevel}%`, v.status]);
      autoTable(doc, { startY: 22, head: [['Reg', 'Model', 'Type', 'Fuel', 'Status']], body: data });
    } else {
      const data = INITIAL_DRIVERS.map((d) => [d.name, d.assignedVehicleReg, `${d.safetyScore}/100`, d.status]);
      autoTable(doc, { startY: 22, head: [['Name', 'Vehicle', 'Safety Score', 'Status']], body: data });
    }

    doc.save(`smartfleet_${reportType.toLowerCase().replace(/ /g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-amber-400" /> Executive Fleet Reports Generator
          </h1>
          <p className="text-xs text-slate-400 mt-1">Multi-category analytical exports in PDF and CSV formats</p>
        </div>

        <button
          onClick={generatePDF}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
        >
          <FileText className="w-4 h-4" /> Download PDF Report
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Select Report Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Trip Report', 'Vehicle Report', 'Driver Report', 'Fuel Report', 'Utilisation Report', 'Alert Report', 'GPS Route Report', 'Carbon Report'].map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                reportType === type
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
