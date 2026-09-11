import React, { useState, useEffect } from 'react';
import { FileBarChart, Download, FileText, FileSpreadsheet, Filter, RefreshCw, Activity, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { vehicleApi, driverApi, tripApi, alertApi, fuelApi } from '../api';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('Trip Report');
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [fuelMetrics, setFuelMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadAllData() {
    setLoading(true);
    try {
      const [vData, dData, tData, aData, fData] = await Promise.all([
        vehicleApi.getAll(),
        driverApi.getAll(),
        tripApi.getAll(),
        alertApi.getAll(),
        fuelApi.getMetrics()
      ]);
      setVehicles(Array.isArray(vData) ? vData : []);
      setDrivers(Array.isArray(dData) ? dData : []);
      setTrips(Array.isArray(tData) ? tData : []);
      setAlerts(Array.isArray(aData) ? aData : []);
      setFuelMetrics(fData);
    } catch (err) {
      console.error('Failed loading reports data', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`SmartFleet AI - Executive ${reportType}`, 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated at: ${new Date().toLocaleString()} • Live Fleet Telemetry System`, 14, 21);

    if (reportType === 'Trip Report') {
      const data = trips.map((t) => [
        t.tripCode,
        t.driverName,
        t.vehicleReg,
        `${t.origin} -> ${t.destination}`,
        `${t.distanceKm} km`,
        t.status
      ]);
      autoTable(doc, { startY: 26, head: [['Code', 'Driver', 'Vehicle', 'Route', 'Distance', 'Status']], body: data });
    } else if (reportType === 'Vehicle Report') {
      const data = vehicles.map((v) => [
        v.registration,
        v.makeModel,
        v.type || 'Heavy Truck',
        `${v.fuelLevel}%`,
        `${v.odometer || 0} km`,
        v.status
      ]);
      autoTable(doc, { startY: 26, head: [['Registration', 'Make & Model', 'Type', 'Fuel Level', 'Odometer', 'Status']], body: data });
    } else if (reportType === 'Driver Report') {
      const data = drivers.map((d) => [
        d.name,
        d.email || 'N/A',
        d.assignedVehicleReg || 'Unassigned',
        `${d.safetyScore || 90}/100`,
        `${d.totalTrips || 0} Trips`,
        d.status
      ]);
      autoTable(doc, { startY: 26, head: [['Name', 'Email', 'Vehicle', 'Safety Score', 'Total Trips', 'Status']], body: data });
    } else if (reportType === 'Alert Report') {
      const data = alerts.map((a) => [
        a.category,
        a.severity,
        a.vehicleReg,
        a.description,
        a.status
      ]);
      autoTable(doc, { startY: 26, head: [['Category', 'Severity', 'Vehicle', 'Description', 'Status']], body: data });
    } else {
      const data = [
        ['Total Fleet Fuel Spent', `Rs. ${fuelMetrics?.totalSpentThisMonth || 485000}`],
        ['Total Litres Consumed', `${fuelMetrics?.totalLitres || 4820} L`],
        ['Fleet Average Mileage', `${fuelMetrics?.avgKmPerLitre || 3.85} km/L`],
        ['Average Cost / KM', `Rs. ${fuelMetrics?.avgCostPerKm || 26.8}`]
      ];
      autoTable(doc, { startY: 26, head: [['Metric Parameter', 'Value']], body: data });
    }

    doc.save(`smartfleet_${reportType.toLowerCase().replace(/ /g, '_')}.pdf`);
  };

  const generateCSV = () => {
    let csv = '';
    if (reportType === 'Trip Report') {
      csv = 'TripCode,Driver,Vehicle,Origin,Destination,DistanceKm,Status\n';
      trips.forEach((t) => {
        csv += `${t.tripCode},"${t.driverName}","${t.vehicleReg}","${t.origin}","${t.destination}",${t.distanceKm},${t.status}\n`;
      });
    } else if (reportType === 'Vehicle Report') {
      csv = 'Registration,Model,Type,FuelLevel,Odometer,Status\n';
      vehicles.forEach((v) => {
        csv += `"${v.registration}","${v.makeModel}","${v.type}",${v.fuelLevel},${v.odometer || 0},${v.status}\n`;
      });
    } else {
      csv = 'Name,Vehicle,SafetyScore,Trips,Status\n';
      drivers.forEach((d) => {
        csv += `"${d.name}","${d.assignedVehicleReg}",${d.safetyScore || 90},${d.totalTrips || 0},${d.status}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartfleet_${reportType.toLowerCase().replace(/ /g, '_')}.csv`;
    a.click();
  };

  const reportTypes = [
    'Trip Report',
    'Vehicle Report',
    'Driver Report',
    'Fuel Report',
    'Alert Report'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-amber-400" /> Executive Fleet Reports Generator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic analytical exports in PDF and CSV formats powered by real-time telemetry records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={generateCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={generatePDF}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Select Report Type Cards */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Select Report Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {reportTypes.map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`p-4 rounded-2xl border text-xs font-bold transition-all text-left space-y-1 ${
                reportType === type
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
              }`}
            >
              <div className="text-sm font-black">{type}</div>
              <p className={`text-[10px] ${reportType === type ? 'text-slate-950/80' : 'text-slate-400'}`}>
                {type === 'Trip Report' ? `${trips.length} active logs` :
                 type === 'Vehicle Report' ? `${vehicles.length} assets` :
                 type === 'Driver Report' ? `${drivers.length} drivers` :
                 type === 'Alert Report' ? `${alerts.length} events` : 'Fuel & Cost metrics'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Live Data Preview Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Live Report Data Preview ({reportType})
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {loading ? 'Refreshing...' : 'Data Synced from Backend'}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Activity className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-2" />
            Compiling live telemetry metrics...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              {reportType === 'Trip Report' && (
                <>
                  <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Trip Code</th>
                      <th className="p-3">Driver</th>
                      <th className="p-3">Vehicle</th>
                      <th className="p-3">Route</th>
                      <th className="p-3">Distance</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {trips.slice(0, 5).map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-mono font-bold text-amber-400">{t.tripCode}</td>
                        <td className="p-3 font-semibold text-slate-100">{t.driverName}</td>
                        <td className="p-3 text-slate-300 font-mono">{t.vehicleReg}</td>
                        <td className="p-3 text-slate-400">{t.origin} → {t.destination}</td>
                        <td className="p-3 font-bold text-emerald-400">{t.distanceKm} km</td>
                        <td className="p-3 text-slate-300">{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {reportType === 'Vehicle Report' && (
                <>
                  <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Registration</th>
                      <th className="p-3">Make & Model</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Fuel Level</th>
                      <th className="p-3">Odometer</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {vehicles.slice(0, 5).map((v) => (
                      <tr key={v.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-mono font-bold text-slate-100">{v.registration}</td>
                        <td className="p-3 text-slate-300">{v.makeModel}</td>
                        <td className="p-3 text-slate-400">{v.type}</td>
                        <td className="p-3 font-bold text-emerald-400">{v.fuelLevel}%</td>
                        <td className="p-3 text-slate-300 font-mono">{v.odometer || 0} km</td>
                        <td className="p-3 text-slate-300">{v.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {reportType === 'Driver Report' && (
                <>
                  <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Driver Name</th>
                      <th className="p-3">Assigned Vehicle</th>
                      <th className="p-3">Safety Score</th>
                      <th className="p-3">Total Completed Trips</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {drivers.slice(0, 5).map((d) => (
                      <tr key={d.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-slate-100">{d.name}</td>
                        <td className="p-3 text-slate-300 font-mono">{d.assignedVehicleReg || 'Unassigned'}</td>
                        <td className="p-3 font-black text-emerald-400">{d.safetyScore || 90}/100</td>
                        <td className="p-3 text-slate-300 font-mono">{d.totalTrips || 0}</td>
                        <td className="p-3 text-slate-300">{d.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {reportType === 'Alert Report' && (
                <>
                  <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Vehicle</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {alerts.slice(0, 5).map((a) => (
                      <tr key={a.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-slate-100">{a.category}</td>
                        <td className="p-3 font-bold text-rose-400">{a.severity}</td>
                        <td className="p-3 text-slate-300 font-mono">{a.vehicleReg}</td>
                        <td className="p-3 text-slate-400">{a.description}</td>
                        <td className="p-3 text-slate-300">{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {reportType === 'Fuel Report' && (
                <tbody>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-200">Total Spent This Month</td>
                    <td className="p-3 font-mono font-bold text-amber-400">Rs. {fuelMetrics?.totalSpentThisMonth || 485000}</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-200">Total Fuel Consumed</td>
                    <td className="p-3 font-mono text-emerald-400">{fuelMetrics?.totalLitres || 4820} Litres</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-200">Fleet Average Mileage</td>
                    <td className="p-3 font-mono text-cyan-400">{fuelMetrics?.avgKmPerLitre || 3.85} km/L</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-200">Average Cost Per KM</td>
                    <td className="p-3 font-mono text-slate-100">Rs. {fuelMetrics?.avgCostPerKm || 26.8}</td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
