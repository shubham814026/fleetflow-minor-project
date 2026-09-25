import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, AlertTriangle, CheckCircle } from 'lucide-react';
import { authApi } from '../api';

export default function SecondaryAuthModal({ isOpen, onClose, onSuccess, title = 'Secondary Authentication Required' }) {
  const [secondaryId, setSecondaryId] = useState('');
  const [secondaryPassword, setSecondaryPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);

  if (!isOpen) return null;

  const isLocked = failedAttempts >= 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    setError('');
    setLoading(true);

    try {
      const res = await authApi.verifySecondaryAuth(secondaryId, secondaryPassword);
      if (res && res.success) {
        onSuccess(res.token);
        onClose();
      }
    } catch (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 3) {
        setError('Maximum failed attempts reached. Access is temporarily locked (Rate Limited).');
      } else {
        setError(`Verification failed: Invalid Secondary Credentials (${3 - newAttempts} attempts remaining)`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glow Header Accent */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">{title}</h3>
            <p className="text-xs text-slate-400">SRS Security Protocol: Enter second independent credential</p>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 mb-5 text-xs text-slate-300">
          Sensitive fields (Govt ID, PAN, Bank Account, Chassis/Engine No.) remain encrypted until secondary authorization is granted.
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Secondary Admin ID</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                disabled={isLocked}
                placeholder="e.g. SEC-1234"
                value={secondaryId}
                onChange={(e) => setSecondaryId(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Secondary Password / Security Key</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                disabled={isLocked}
                placeholder="••••••••"
                value={secondaryPassword}
                onChange={(e) => setSecondaryPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800">
            <span>Authorized ID & Password:</span>
            <span className="font-mono font-bold text-amber-400">SEC-1234 / Sec@123</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>Verifying Credentials...</>
              ) : isLocked ? (
                <>Rate Limited (Locked)</>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Authorize & Unlock Data
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
