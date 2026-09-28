import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Search,
  Download,
  Filter,
  RefreshCcw,
  Plus,
  CheckCircle2,
  Calendar,
  UserCheck
} from 'lucide-react';
import { auditApi } from '../api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState({
    action: '',
    target: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await auditApi.getAll({ search: searchQuery });
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed loading audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (log.user && log.user.toLowerCase().includes(q)) ||
        (log.action && log.action.toLowerCase().includes(q)) ||
        (log.target && log.target.toLowerCase().includes(q)) ||
        (log.ip && log.ip.includes(q));

      const matchesRole =
        roleFilter === 'ALL' ||
        (log.role && log.role.toLowerCase().replace(/[\s_-]/g, '') === roleFilter.toLowerCase().replace(/[\s_-]/g, ''));

      const matchesAction =
        actionFilter === 'ALL' ||
        (log.action && log.action.toLowerCase().includes(actionFilter.toLowerCase()));

      return matchesSearch && matchesRole && matchesAction;
    });
  }, [logs, searchQuery, roleFilter, actionFilter]);

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert('No audit logs available to export');
      return;
    }

    const headers = ['ID', 'User', 'Role', 'Security Action', 'Target Entity', 'Timestamp', 'IP Address'];
    const rows = filteredLogs.map((log) => [
      `"${log.id || ''}"`,
      `"${log.user || ''}"`,
      `"${log.role || ''}"`,
      `"${log.action || ''}"`,
      `"${log.target || ''}"`,
      `"${new Date(log.timestamp).toISOString()}"`,
      `"${log.ip || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `smartfleet_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateAuditLog = async (e) => {
    e.preventDefault();
    if (!logForm.action) return;

    setIsSubmitting(true);
    try {
      const newEntry = await auditApi.log({
        action: logForm.action,
        target: logForm.target || 'Manual Compliance Entry',
        role: 'Super Admin',
        user: 'admin@fleetflow.com'
      });

      setLogs((prev) => [newEntry, ...prev]);
      setShowLogModal(false);
      setLogForm({ action: '', target: '', notes: '' });
      alert('Audit log recorded successfully');
    } catch (err) {
      alert('Error creating audit entry: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-amber-400" /> Security Audit Log Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident audit trail for secondary credential unlocks, sensitive vehicle telematics & configuration changes
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh Audit Logs"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export CSV
          </button>

          <button
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Log Custom Event
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search user, action, target or IP..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Security Actions</option>
              <option value="Secondary">Secondary Auth</option>
              <option value="Profile">Profile Updates</option>
              <option value="Settings">System Settings</option>
              <option value="Status">Status Modifications</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="SUB_ADMIN">Sub-Admin</option>
              <option value="ACCOUNTANT">Accountant / HR</option>
              <option value="DRIVER">Driver</option>
            </select>
          </div>

          <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            {filteredLogs.length} Events
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Security Action</th>
                <th className="p-4">Target Resource</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Network IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 italic">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isFailure = log.action && log.action.toLowerCase().includes('fail');
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors font-mono">
                      <td className="p-4 font-bold text-slate-100 flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{log.user || log.userEmail || 'admin@fleetflow.com'}</span>
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {log.role || log.userRole || 'SUPER_ADMIN'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1 ${
                            isFailure
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          {isFailure ? (
                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                          ) : (
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          )}
                          {log.action}
                        </span>
                      </td>

                      <td className="p-4 text-slate-400">{log.target || log.targetType || 'System Resource'}</td>

                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                      <td className="p-4 text-slate-500 text-[11px]">{log.ip || '127.0.0.1'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Audit Entry Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-left">
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-amber-400" /> Record Custom Audit Event
            </h3>

            <form onSubmit={handleCreateAuditLog} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Security Action</label>
                <input
                  type="text"
                  value={logForm.action}
                  onChange={(e) => setLogForm({ ...logForm, action: e.target.value })}
                  placeholder="e.g. Manual Database Export, Driver Key Reassignment"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Entity / Resource</label>
                <input
                  type="text"
                  value={logForm.target}
                  onChange={(e) => setLogForm({ ...logForm, target: e.target.value })}
                  placeholder="e.g. Vehicle KA-01-EQ-9042 or Driver Rajesh Kumar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black"
                >
                  {isSubmitting ? 'Logging...' : 'Commit Audit Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

