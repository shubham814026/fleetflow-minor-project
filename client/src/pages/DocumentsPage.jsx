import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, CheckCircle2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { documentApi } from '../api';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'Licence',
    entity: '',
    expiryDate: '',
    status: 'Valid'
  });
  const [saving, setSaving] = useState(false);

  async function loadDocuments() {
    setLoading(true);
    try {
      const data = await documentApi.getAll();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching documents', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await documentApi.create(form);
      setDocuments((prev) => [created, ...prev]);
      setShowAddModal(false);
      setForm({
        title: '',
        type: 'Licence',
        entity: '',
        expiryDate: '',
        status: 'Valid'
      });
    } catch (err) {
      console.error('Failed to create document', err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = documents.filter((doc) => {
    const matchesSearch =
      (doc.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (doc.entity || '').toLowerCase().includes(search.toLowerCase()) ||
      (doc.type || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" /> Digital Document & Compliance Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Driving licence, vehicle insurance policy & PUC certificate validity tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDocuments}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh Documents"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Upload Document
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search documents by title, driver name, vehicle registration..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full py-2 px-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Document Types</option>
            <option value="Licence">Driving Licence</option>
            <option value="Insurance">Vehicle Insurance</option>
            <option value="PUC">PUC Certificate</option>
            <option value="Fitness">Fitness Certificate</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Loading compliance documents...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No documents matching the criteria found.
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => {
                  const expiry = doc.expiryDate || doc.expiry || 'N/A';
                  const status = doc.status || 'Valid';
                  return (
                    <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-slate-100 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{doc.title}</span>
                      </td>
                      <td className="p-4 font-medium text-slate-300">{doc.type}</td>
                      <td className="p-4 text-slate-400">{doc.entity}</td>
                      <td className="p-4 font-semibold text-slate-200">{expiry}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                            status === 'Valid'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : status === 'Expiring Soon'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" /> Upload New Compliance Document
            </h3>

            <form onSubmit={handleCreateDocument} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Fitness Certificate"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Document Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="Licence">Driving Licence</option>
                  <option value="Insurance">Vehicle Insurance</option>
                  <option value="PUC">PUC Certificate</option>
                  <option value="Fitness">Fitness Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Target Entity (Vehicle or Driver)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vehicle KA-01-EQ-9042 or Driver Rajesh Kumar"
                  value={form.entity}
                  onChange={(e) => setForm({ ...form, entity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-400 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20"
                >
                  {saving ? 'Saving...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
