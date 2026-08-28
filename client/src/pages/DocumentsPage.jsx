import React, { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle2, Clock, Filter } from 'lucide-react';

export default function DocumentsPage() {
  const documents = [
    { id: 'doc-1', title: 'Driving Licence - Rajesh Kumar', type: 'Licence', entity: 'Driver drv-201', expiry: '2028-04-14', status: 'Valid' },
    { id: 'doc-2', title: 'Vehicle Insurance - KA-01-EQ-9042', type: 'Insurance', entity: 'Vehicle veh-101', expiry: '2026-11-20', status: 'Valid' },
    { id: 'doc-3', title: 'PUC Certificate - MH-12-PQ-4821', type: 'PUC', entity: 'Vehicle veh-102', expiry: '2026-09-05', status: 'Expiring Soon' },
    { id: 'doc-4', title: 'Driving Licence - Venkatesh R', type: 'Licence', entity: 'Driver drv-204', expiry: '2026-06-30', status: 'Expired' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <FileText className="w-6 h-6 text-amber-400" /> Digital Document & Compliance Center
        </h1>
        <p className="text-xs text-slate-400 mt-1">Driving licence, insurance policy & PUC validity tracking</p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Document Title</th>
                <th className="p-4">Type</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-slate-100">{doc.title}</td>
                  <td className="p-4 font-medium text-slate-300">{doc.type}</td>
                  <td className="p-4 text-slate-400">{doc.entity}</td>
                  <td className="p-4 font-semibold text-slate-200">{doc.expiry}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                        doc.status === 'Valid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : doc.status === 'Expiring Soon'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {doc.status}
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
