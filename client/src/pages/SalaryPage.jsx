import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  CreditCard,
  UserCheck,
  Calendar,
  X,
  Printer,
  ChevronRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { salaryApi, driverApi } from '../api';

export default function SalaryPage() {
  const [salaries, setSalaries] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalDisbursed: 0,
    totalPending: 0,
    totalFailed: 0,
    avgSalary: 0
  });
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [activePayslip, setActivePayslip] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);

  // New Payroll Form State
  const [newPayroll, setNewPayroll] = useState({
    driverId: '',
    driverName: '',
    month: 'September 2026',
    baseAmount: 32000,
    tripBonus: 5000,
    overtime: 1500,
    deductions: 0,
    tripsCompleted: 12,
    due: '2026-09-30'
  });

  async function loadData() {
    setLoading(true);
    try {
      const [salaryRes, driverData] = await Promise.all([
        salaryApi.getAll({ month: monthFilter, status: statusFilter, search }),
        driverApi.getAll()
      ]);

      const records = salaryRes?.data || (Array.isArray(salaryRes) ? salaryRes : []);
      setSalaries(records);

      if (salaryRes?.stats) {
        setStats(salaryRes.stats);
      } else {
        const totalDisbursed = records.filter(s => s.status === 'Credited').reduce((a, b) => a + (Number(b.amount) || 0), 0);
        const totalPending = records.filter(s => s.status === 'Pending').reduce((a, b) => a + (Number(b.amount) || 0), 0);
        const totalFailed = records.filter(s => s.status === 'Failed').reduce((a, b) => a + (Number(b.amount) || 0), 0);
        const avg = records.length ? Math.round(records.reduce((a, b) => a + (Number(b.amount) || 0), 0) / records.length) : 0;
        setStats({
          totalRecords: records.length,
          totalDisbursed,
          totalPending,
          totalFailed,
          avgSalary: avg
        });
      }

      setDrivers(Array.isArray(driverData) ? driverData : []);
    } catch (err) {
      console.error('Failed loading salary records', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [monthFilter, statusFilter]);

  const handleUpdate = async (id, status) => {
    setProcessingId(id);
    try {
      const res = await salaryApi.updateStatus(id, status);
      setSalaries(prev =>
        prev.map(s => (s.id === id ? { ...s, status, txnId: res.txnId, disbursedAt: res.disbursedAt } : s))
      );
      setAlertMsg({ type: 'success', text: `Salary updated to ${status} for transaction ${res.txnId || ''}` });
      setTimeout(() => setAlertMsg(null), 4000);
      loadData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed to update salary disbursement' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleBatchDisburse = async () => {
    const pendingIds = salaries.filter(s => s.status === 'Pending').map(s => s.id);
    if (!pendingIds.length) {
      setAlertMsg({ type: 'info', text: 'No pending salary records to disburse.' });
      setTimeout(() => setAlertMsg(null), 3000);
      return;
    }

    setLoading(true);
    try {
      const res = await salaryApi.batchDisburse(pendingIds);
      setAlertMsg({ type: 'success', text: res.message || 'All pending payouts credited successfully!' });
      loadData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Error executing batch disbursement' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayroll = async (e) => {
    e.preventDefault();
    if (!newPayroll.driverName) {
      setAlertMsg({ type: 'error', text: 'Please select or enter a driver name' });
      return;
    }

    try {
      const created = await salaryApi.create(newPayroll);
      setSalaries(prev => [created, ...prev]);
      setIsAddModalOpen(false);
      setAlertMsg({ type: 'success', text: `Payroll created for ${newPayroll.driverName}` });
      loadData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Failed creating payroll entry' });
    }
  };

  const handleDriverSelect = (e) => {
    const driverId = e.target.value;
    const selected = drivers.find(d => d.id === driverId);
    if (selected) {
      setNewPayroll(prev => ({
        ...prev,
        driverId: selected.id,
        driverName: selected.name,
        tripsCompleted: selected.totalTrips || 10,
        tripBonus: (selected.totalTrips || 10) * 450
      }));
    }
  };

  const viewPayslip = (sal) => {
    setActivePayslip(sal);
    setIsPayslipModalOpen(true);
  };

  const downloadPayslipPDF = (sal) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.text('SmartFleet AI — Official Driver Pay Slip', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Disbursement Month: ${sal.month}`, 14, 28);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 34);

    const breakdown = [
      ['Driver Name', sal.driverName],
      ['Driver ID', sal.driverId || 'DRV-N/A'],
      ['Completed Trips', `${sal.tripsCompleted || 12} Trips Logged`],
      ['Base Monthly Wage', `Rs. ${(sal.baseAmount || sal.amount * 0.8).toLocaleString()}`],
      ['Trip Mileage Incentive', `Rs. ${(sal.tripBonus || sal.amount * 0.15).toLocaleString()}`],
      ['Overtime / Shift Allowance', `Rs. ${(sal.overtime || sal.amount * 0.05).toLocaleString()}`],
      ['Tax / Advance Deductions', `Rs. ${(sal.deductions || 0).toLocaleString()}`],
      ['Net Disbursed Amount', `Rs. ${sal.amount.toLocaleString()}`],
      ['Payment Status', sal.status],
      ['Bank Transaction Reference', sal.txnId || 'Pending Clearance']
    ];

    autoTable(doc, {
      startY: 40,
      head: [['Salary Component', 'Amount / Information']],
      body: breakdown,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] }
    });

    doc.save(`Payslip_${sal.driverName.replace(/\s+/g, '_')}_${sal.month}.pdf`);
  };

  const exportSalaryCSV = () => {
    let csv = 'DriverName,DriverID,Month,TripsCompleted,BaseWage,Incentive,Overtime,Deductions,NetAmount,Status,TxnID\n';
    salaries.forEach(s => {
      csv += `"${s.driverName}","${s.driverId || ''}","${s.month}",${s.tripsCompleted || 0},${s.baseAmount || s.amount},${s.tripBonus || 0},${s.overtime || 0},${s.deductions || 0},${s.amount},"${s.status}","${s.txnId}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartfleet_payroll_${monthFilter.toLowerCase().replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  const filteredSalaries = salaries.filter(s => {
    const q = search.toLowerCase();
    return (
      (s.driverName || '').toLowerCase().includes(q) ||
      (s.driverId || '').toLowerCase().includes(q) ||
      (s.txnId || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Alert Notification */}
      {alertMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-bold border flex items-center justify-between ${
            alertMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : alertMsg.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
          }`}
        >
          <span>{alertMsg.text}</span>
          <button onClick={() => setAlertMsg(null)} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-amber-400" /> Driver Payroll & Salary Module
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic driver compensation ledger, automated distance & trip incentive disbursement, and digital payslips
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh Payroll"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <button
            onClick={exportSalaryCSV}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV
          </button>
          <button
            onClick={handleBatchDisburse}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <CreditCard className="w-4 h-4" /> Batch Disburse Pending
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Generate Payroll
          </button>
        </div>
      </div>

      {/* Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">Total Disbursed (Credited)</span>
          <span className="text-2xl font-black text-emerald-400">₹ {stats.totalDisbursed.toLocaleString()}</span>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completed bank transfers
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">Pending Approval & Credit</span>
          <span className="text-2xl font-black text-amber-400">₹ {stats.totalPending.toLocaleString()}</span>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" /> Ready for disbursement
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">Failed Payouts</span>
          <span className="text-2xl font-black text-rose-400">₹ {stats.totalFailed.toLocaleString()}</span>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-400" /> Bank gateway retry needed
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">Average Driver Compensation</span>
          <span className="text-2xl font-black text-cyan-400">₹ {stats.avgSalary.toLocaleString()}</span>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-cyan-400" /> {stats.totalRecords} Active Driver Ledgers
          </p>
        </div>
      </div>

      {/* Search & Filtering Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search driver name, driver ID, or transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Months</option>
            <option value="September 2026">September 2026</option>
            <option value="August 2026">August 2026</option>
            <option value="July 2026">July 2026</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Credited">Credited</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Salary Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Driver Name & ID</th>
                <th className="p-4">Disbursement Month</th>
                <th className="p-4">Trips Logged</th>
                <th className="p-4">Net Payout</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Bank Ref / Txn ID</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 text-amber-500 animate-spin mx-auto mb-2" />
                    Fetching live driver payroll ledger...
                  </td>
                </tr>
              ) : filteredSalaries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No payroll records found.
                  </td>
                </tr>
              ) : (
                filteredSalaries.map((sal) => (
                  <tr key={sal.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{sal.driverName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{sal.driverId || 'DRV-N/A'}</div>
                    </td>
                    <td className="p-4 text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {sal.month}
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      <span className="font-bold text-amber-400">{sal.tripsCompleted || 10}</span> Trips
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      ₹ {sal.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-400">{sal.due}</td>
                    <td className="p-4 font-mono text-slate-300 text-[11px]">{sal.txnId}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                          sal.status === 'Credited'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : sal.status === 'Pending'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {sal.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewPayslip(sal)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          title="View Payslip"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" /> Payslip
                        </button>

                        {sal.status !== 'Credited' && (
                          <button
                            disabled={processingId === sal.id}
                            onClick={() => handleUpdate(sal.id, 'Credited')}
                            className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                          >
                            {processingId === sal.id ? 'Processing...' : 'Credit'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Payroll Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" /> Generate Driver Payroll Record
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayroll} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Select Driver</label>
                <select
                  value={newPayroll.driverId}
                  onChange={handleDriverSelect}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose from Registered Fleet Drivers --</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.id}) — Score: {d.safetyScore || 90}
                    </option>
                  ))}
                </select>
              </div>

              {!newPayroll.driverId && (
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Or Enter Driver Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Chandra"
                    value={newPayroll.driverName}
                    onChange={(e) => setNewPayroll({ ...newPayroll, driverName: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Disbursement Month</label>
                  <select
                    value={newPayroll.month}
                    onChange={(e) => setNewPayroll({ ...newPayroll, month: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  >
                    <option value="September 2026">September 2026</option>
                    <option value="October 2026">October 2026</option>
                    <option value="August 2026">August 2026</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Trips Completed</label>
                  <input
                    type="number"
                    value={newPayroll.tripsCompleted}
                    onChange={(e) => setNewPayroll({ ...newPayroll, tripsCompleted: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Base Wage (₹)</label>
                  <input
                    type="number"
                    value={newPayroll.baseAmount}
                    onChange={(e) => setNewPayroll({ ...newPayroll, baseAmount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Trip Bonus / Allowance (₹)</label>
                  <input
                    type="number"
                    value={newPayroll.tripBonus}
                    onChange={(e) => setNewPayroll({ ...newPayroll, tripBonus: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Overtime (₹)</label>
                  <input
                    type="number"
                    value={newPayroll.overtime}
                    onChange={(e) => setNewPayroll({ ...newPayroll, overtime: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Deductions (₹)</label>
                  <input
                    type="number"
                    value={newPayroll.deductions}
                    onChange={(e) => setNewPayroll({ ...newPayroll, deductions: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
                <span className="text-slate-400 font-bold">Total Net Compensation:</span>
                <span className="text-emerald-400 font-black text-sm">
                  ₹ {(Number(newPayroll.baseAmount) + Number(newPayroll.tripBonus) + Number(newPayroll.overtime) - Number(newPayroll.deductions)).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black shadow-lg shadow-amber-500/20"
                >
                  Confirm & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Payslip Modal */}
      {isPayslipModalOpen && activePayslip && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-100">Driver Digital Payslip</h3>
                <p className="text-[11px] text-slate-400">{activePayslip.month} • Fleet Compensation Voucher</p>
              </div>
              <button onClick={() => setIsPayslipModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Driver Name:</span>
                  <span className="font-bold text-slate-100">{activePayslip.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Driver ID:</span>
                  <span className="font-mono text-slate-300">{activePayslip.driverId || 'DRV-N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trips Logged:</span>
                  <span className="text-amber-400 font-bold">{activePayslip.tripsCompleted || 12} Verified Runs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status:</span>
                  <span
                    className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                      activePayslip.status === 'Credited'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {activePayslip.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank Txn Ref:</span>
                  <span className="font-mono text-slate-300">{activePayslip.txnId}</span>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
                <div className="p-2.5 flex justify-between bg-slate-950/50">
                  <span className="text-slate-400">Base Monthly Salary:</span>
                  <span className="font-mono text-slate-200">
                    ₹ {(activePayslip.baseAmount || activePayslip.amount * 0.8).toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 flex justify-between bg-slate-950/50">
                  <span className="text-slate-400">Mileage & Trip Incentive:</span>
                  <span className="font-mono text-emerald-400">
                    + ₹ {(activePayslip.tripBonus || activePayslip.amount * 0.15).toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 flex justify-between bg-slate-950/50">
                  <span className="text-slate-400">Overtime Allowance:</span>
                  <span className="font-mono text-amber-400">
                    + ₹ {(activePayslip.overtime || activePayslip.amount * 0.05).toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 flex justify-between bg-slate-950/50">
                  <span className="text-slate-400">Deductions:</span>
                  <span className="font-mono text-rose-400">
                    - ₹ {(activePayslip.deductions || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 flex justify-between bg-slate-950 font-bold">
                  <span className="text-slate-100">Total Net Disbursed:</span>
                  <span className="font-mono text-base text-emerald-400">
                    ₹ {activePayslip.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => downloadPayslipPDF(activePayslip)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Printer className="w-4 h-4" /> Download PDF Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
