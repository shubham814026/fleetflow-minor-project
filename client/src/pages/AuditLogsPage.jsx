import React, { useState, useEffect } from 'react';
import { ClipboardList, ShieldAlert, Lock } from 'lucide-react';
import { auditApi } from '../api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await auditApi.getAll();
        setLogs(data);
      } catch (err) {
        console.error('Failed loading audit logs', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-amber-400" /> Security Audit Log Ledger
        </h1>
        <p className="text-xs text-slate-400 mt-1">Super Admin audit trail for secondary credential unlocks & sensitive data access</p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Security Action</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors font-mono">
                  <td className="p-4 font-bold text-slate-100">{log.user}</td>
                  <td className="p-4 text-amber-400 font-semibold">{log.role}</td>
                  <td className="p-4 text-slate-200">{log.action}</td>
                  <td className="p-4 text-slate-400">{log.target}</td>
                  <td className="p-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 text-slate-500">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
