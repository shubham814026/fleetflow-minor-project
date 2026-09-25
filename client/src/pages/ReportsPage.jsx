import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  FileText,
  FileSpreadsheet,
  Filter,
  RefreshCw,
  Activity,
  CheckCircle2,
  Calendar,
  Search,
  Truck,
  Users,
  AlertTriangle,
  Fuel,
  Compass
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { vehicleApi, driverApi, tripApi, alertApi, fuelApi, reportApi } from '../api';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('Trip Report');
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [fuelMetrics, setFuelMetrics] = useState(null);
  const [executiveSummary, setExecutiveSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('This Month');

  async function loadAllData() {
    setLoading(true);
    try {
      const [vData, dData, tData, aData, fData, sumData] = await Promise.all([
        vehicleApi.getAll(),
        driverApi.getAll(),
        tripApi.getAll(),
        alertApi.getAll(),
        fuelApi.getMetrics(),
        reportApi.getSummary()
      ]);
      setVehicles(Array.isArray(vData) ? vData : []);
      setDrivers(Array.isArray(dData) ? dData : []);
      setTrips(Array.isArray(tData) ? tData : []);
      setAlerts(Array.isArray(aData) ? aData : []);
      setFuelMetrics(fData || {});
      setExecutiveSummary(sumData);
    } catch (err) {
      console.error('Failed loading reports data', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  // Compute live dynamic summary
  const totalTripKm = trips.reduce((acc, t) => acc + (Number(t.distanceKm) || 0), 0);
  const totalFuelLitres = fuelMetrics?.totalLitres || Math.round(totalTripKm > 0 ? totalTripKm / 3.8 : 4820);
  const totalFuelCost = fuelMetrics?.totalSpentThisMonth || Math.round(totalFuelLitres * 95);
  const avgMileage = fuelMetrics?.avgKmPerLitre || 3.85;
  const avgCostPerKm = totalTripKm > 0 ? (totalFuelCost / totalTripKm).toFixed(2) : (fuelMetrics?.avgCostPerKm || '24.7');

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.text(`SmartFleet AI — Executive ${reportType}`, 14, 16);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated at: ${new Date().toLocaleString()} • Filter: ${dateRange} • Live Telemetry Ledger`, 14, 22);

    if (reportType === 'Trip Report') {
      const data = filteredTrips.map((t) => [
        t.tripCode,
        t.driverName,
        t.vehicleReg,
        `${t.origin} -> ${t.destination}`,
        `${t.distanceKm} km`,
        t.status
      ]);
      autoTable(doc, {
        startY: 27,
        head: [['Code', 'Driver', 'Vehicle', 'Route', 'Distance', 'Status']],
        body: data,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] }
      });
    } else if (reportType === 'Vehicle Report') {
      const data = filteredVehicles.map((v) => [
        v.registration,
        v.makeModel,
        v.type || 'Heavy Truck',
        `${v.fuelLevel}%`,
        `${v.odometer || 0} km`,
        v.status
      ]);
      autoTable(doc, {
        startY: 27,
        head: [['Registration', 'Make & Model', 'Type', 'Fuel Level', 'Odometer', 'Status']],
        body: data,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
      });
    } else if (reportType === 'Driver Report') {
      const data = filteredDrivers.map((d) => [
        d.name,
        d.email || 'N/A',
        d.assignedVehicleReg || 'Unassigned',
        `${d.safetyScore || 90}/100`,
        `${d.totalTrips || 0} Trips`,
        d.status
      ]);
      autoTable(doc, {
        startY: 27,
        head: [['Name', 'Email', 'Vehicle', 'Safety Score', 'Total Trips', 'Status']],
        body: data,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] }
      });
    } else if (reportType === 'Alert Report') {
      const data = filteredAlerts.map((a) => [
        a.category,
        a.severity,
        a.vehicleReg,
        a.description,
        a.status
      ]);
      autoTable(doc, {
        startY: 27,
        head: [['Category', 'Severity', 'Vehicle', 'Description', 'Status']],
        body: data,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68] }
      });
    } else {
      const data = [
        ['Total Fleet Fuel Expenditure', `Rs. ${Number(totalFuelCost).toLocaleString()}`],
        ['Total Diesel Litres Consumed', `${Number(totalFuelLitres).toLocaleString()} L`],
        ['Fleet Average Mileage', `${avgMileage} km/L`],
        ['Average Fuel Cost / KM', `Rs. ${avgCostPerKm} / km`],
        ['Estimated Total Kilometers Driven', `${totalTripKm.toLocaleString()} km`]
      ];
      autoTable(doc, {
        startY: 27,
        head: [['Fuel & Efficiency Metric', 'Calculated Value']],
        body: data,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] }
      });
    }

    doc.save(`smartfleet_${reportType.toLowerCase().replace(/ /g, '_')}_${Date.now()}.pdf`);
  };

  const generateCSV = () => {
    let csv = '';
    if (reportType === 'Trip Report') {
      csv = 'TripCode,Driver,Vehicle,Origin,Destination,DistanceKm,Status\n';
      filteredTrips.forEach((t) => {
        csv += `${t.tripCode},"${t.driverName}","${t.vehicleReg}","${t.origin}","${t.destination}",${t.distanceKm},${t.status}\n`;
      });
    } else if (reportType === 'Vehicle Report') {
      csv = 'Registration,Model,Type,FuelLevel,Odometer,Status\n';
      filteredVehicles.forEach((v) => {
        csv += `"${v.registration}","${v.makeModel}","${v.type || 'Heavy Truck'}",${v.fuelLevel},${v.odometer || 0},${v.status}\n`;
      });
    } else if (reportType === 'Driver Report') {
      csv = 'Name,Email,AssignedVehicle,SafetyScore,TotalTrips,Status\n';
      filteredDrivers.forEach((d) => {
        csv += `"${d.name}","${d.email || 'N/A'}","${d.assignedVehicleReg || 'Unassigned'}",${d.safetyScore || 90},${d.totalTrips || 0},${d.status}\n`;
      });
    } else if (reportType === 'Alert Report') {
      csv = 'Category,Severity,Vehicle,Description,Status\n';
      filteredAlerts.forEach((a) => {
        csv += `"${a.category}","${a.severity}","${a.vehicleReg}","${a.description.replace(/"/g, '""')}","${a.status}"\n`;
      });
    } else {
      csv = 'MetricParameter,Value\n';
      csv += `"Total Fuel Spent","Rs. ${totalFuelCost}"\n`;
      csv += `"Total Litres Consumed","${totalFuelLitres} L"\n`;
      csv += `"Average Mileage","${avgMileage} km/L"\n`;
      csv += `"Average Cost Per KM","Rs. ${avgCostPerKm}"\n`;
      csv += `"Total Logged Distance","${totalTripKm} km"\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartfleet_${reportType.toLowerCase().replace(/ /g, '_')}.csv`;
    a.click();
  };

  const reportTypes = [
    { label: 'Trip Report', count: trips.length, icon: Compass },
    { label: 'Vehicle Report', count: vehicles.length, icon: Truck },
    { label: 'Driver Report', count: drivers.length, icon: Users },
    { label: 'Alert Report', count: alerts.length, icon: AlertTriangle },
    { label: 'Fuel Report', count: `${totalFuelLitres}L`, icon: Fuel }
  ];

  const q = search.toLowerCase();

  const filteredTrips = trips.filter(
    (t) =>
      (t.tripCode || '').toLowerCase().includes(q) ||
      (t.driverName || '').toLowerCase().includes(q) ||
      (t.vehicleReg || '').toLowerCase().includes(q) ||
      (t.origin || '').toLowerCase().includes(q) ||
      (t.destination || '').toLowerCase().includes(q)
  );

  const filteredVehicles = vehicles.filter(
    (v) =>
      (v.registration || '').toLowerCase().includes(q) ||
      (v.makeModel || '').toLowerCase().includes(q) ||
      (v.status || '').toLowerCase().includes(q)
  );

  const filteredDrivers = drivers.filter(
    (d) =>
      (d.name || '').toLowerCase().includes(q) ||
      (d.email || '').toLowerCase().includes(q) ||
      (d.assignedVehicleReg || '').toLowerCase().includes(q)
  );

  const filteredAlerts = alerts.filter(
    (a) =>
      (a.category || '').toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q) ||
      (a.vehicleReg || '').toLowerCase().includes(q) ||
      (a.severity || '').toLowerCase().includes(q)
  );

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

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadAllData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <button
            onClick={generateCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={generatePDF}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Select Report Type Cards */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100">Select Report Category</h3>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="py-1 px-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="All Time">All Time</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {reportTypes.map((item) => {
            const Icon = item.icon;
            const isSelected = reportType === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setReportType(item.label)}
                className={`p-4 rounded-2xl border text-xs font-bold transition-all text-left space-y-2 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.count}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-black">{item.label}</div>
                  <p className={`text-[10px] ${isSelected ? 'text-slate-950/80' : 'text-slate-400'}`}>
                    Live Telemetry Set
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      {reportType !== 'Fuel Report' && (
        <div className="relative bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-6 top-5" />
          <input
            type="text"
            placeholder={`Search within ${reportType}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      )}

      {/* Live Data Preview Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Live Report Data Preview ({reportType})
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {loading ? 'Refreshing...' : 'Data Synced from Backend Telemetry'}
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
                    {filteredTrips.slice(0, 10).map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-mono font-bold text-amber-400">{t.tripCode}</td>
                        <td className="p-3 font-semibold text-slate-100">{t.driverName}</td>
                        <td className="p-3 text-slate-300 font-mono">{t.vehicleReg}</td>
                        <td className="p-3 text-slate-400">
                          {t.origin} → {t.destination}
                        </td>
                        <td className="p-3 font-bold text-emerald-400">{t.distanceKm} km</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.status === 'Completed'
                                ? 'bg-blue-500/20 text-blue-400'
                                : t.status === 'In Transit'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-700/50 text-slate-400'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
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
                    {filteredVehicles.slice(0, 10).map((v) => (
                      <tr key={v.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-mono font-bold text-slate-100">{v.registration}</td>
                        <td className="p-3 text-slate-300">{v.makeModel}</td>
                        <td className="p-3 text-slate-400">{v.type || 'Heavy Truck'}</td>
                        <td className="p-3 font-bold text-emerald-400">{v.fuelLevel}%</td>
                        <td className="p-3 text-slate-300 font-mono">{(v.odometer || 0).toLocaleString()} km</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              v.status === 'Active'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : v.status === 'Maintenance'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
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
                    {filteredDrivers.slice(0, 10).map((d) => (
                      <tr key={d.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-slate-100">{d.name}</td>
                        <td className="p-3 text-slate-300 font-mono">{d.assignedVehicleReg || 'Unassigned'}</td>
                        <td className="p-3 font-black text-emerald-400">{d.safetyScore || 90}/100</td>
                        <td className="p-3 text-slate-300 font-mono">{d.totalTrips || 0}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.status === 'Active'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-700/50 text-slate-400'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
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
                    {filteredAlerts.slice(0, 10).map((a) => (
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
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-slate-200">Total Fleet Fuel Expenditure</td>
                    <td className="p-4 font-mono font-bold text-amber-400 text-sm">
                      ₹ {Number(totalFuelCost).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-slate-200">Total Diesel Litres Consumed</td>
                    <td className="p-4 font-mono text-emerald-400 text-sm">
                      {Number(totalFuelLitres).toLocaleString()} Litres
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-slate-200">Fleet Average Mileage</td>
                    <td className="p-4 font-mono text-cyan-400 text-sm">{avgMileage} km/L</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-slate-200">Average Fleet Fuel Cost Per KM</td>
                    <td className="p-4 font-mono text-slate-100 text-sm">₹ {avgCostPerKm} / km</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-slate-200">Total Kilometers Covered</td>
                    <td className="p-4 font-mono text-slate-300 text-sm">{totalTripKm.toLocaleString()} km</td>
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
