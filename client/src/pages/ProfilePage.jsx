import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Mail,
  Key,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Building,
  Briefcase,
  Edit3,
  Save,
  X,
  Lock,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    department: '',
    designation: '',
    emergencyContact: '',
    bio: ''
  });

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [sessionTime, setSessionTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile();
      setProfile(data);
      setEditForm({
        name: data.name || '',
        phone: data.phone || '',
        department: data.department || '',
        designation: data.designation || '',
        emergencyContact: data.emergencyContact || '',
        bio: data.bio || ''
      });
    } catch (err) {
      console.error('Failed to load dynamic profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await profileApi.updateProfile(editForm);
      const updated = res.data?.user || res.user || editForm;

      setProfile((prev) => ({ ...prev, ...updated }));
      setIsEditing(false);
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });

      // Update local storage auth if present
      const raw = localStorage.getItem('fleetflow_auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.user = { ...parsed.user, name: editForm.name };
        localStorage.setItem('fleetflow_auth', JSON.stringify(parsed));
      }

      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.error?.message || err.message || 'Failed to update profile'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      await profileApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setStatusMessage({ type: 'success', text: 'Security credentials updated successfully!' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setPasswordError(err.response?.data?.error?.message || err.message || 'Error updating password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const secondaryToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('fleetflow_secondary_token') : null;

  return (
    <div className="space-y-6 max-w-3xl text-left">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <User className="w-6 h-6 text-amber-400" /> User Profile & Security Identity
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic authenticated user credentials, department roles, and session security status
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-colors"
            >
              <Edit3 className="w-4 h-4 text-amber-400" /> Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          )}

          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors"
          >
            <Lock className="w-4 h-4" /> Change Password
          </button>
        </div>
      </div>

      {/* Status Feedback Toast */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 border shadow-lg animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          {statusMessage.text}
        </div>
      )}

      {/* Profile Details Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6 text-xs">
        {/* User Identity Header */}
        <div className="flex items-center gap-5 border-b border-slate-800 pb-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-xl shadow-amber-500/20">
            {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-100">{profile?.name || user?.name || 'Fleet Administrator'}</h2>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] border border-amber-500/30">
                {profile?.role || user?.role || 'SUPER_ADMIN'}
              </span>
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                {profile?.designation || 'Head of Operations'}
              </span>
            </div>
          </div>
        </div>

        {!isEditing ? (
          /* View Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-500 flex items-center gap-2 text-[11px]">
                <Mail className="w-4 h-4 text-indigo-400" /> Email Address
              </span>
              <span className="font-semibold text-slate-200 block text-xs">{profile?.email || 'admin@fleetflow.com'}</span>
            </div>

            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-500 flex items-center gap-2 text-[11px]">
                <Phone className="w-4 h-4 text-emerald-400" /> Contact Phone
              </span>
              <span className="font-semibold text-slate-200 block text-xs">{profile?.phone || '+91 98765 43210'}</span>
            </div>

            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-500 flex items-center gap-2 text-[11px]">
                <Building className="w-4 h-4 text-cyan-400" /> Assigned Department
              </span>
              <span className="font-semibold text-slate-200 block text-xs">{profile?.department || 'Fleet Operations'}</span>
            </div>

            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-500 flex items-center gap-2 text-[11px]">
                <Phone className="w-4 h-4 text-rose-400" /> Emergency Contact
              </span>
              <span className="font-semibold text-slate-200 block text-xs">{profile?.emergencyContact || '+91 98765 00000'}</span>
            </div>

            <div className="md:col-span-2 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-500 flex items-center gap-2 text-[11px]">
                <User className="w-4 h-4 text-amber-400" /> Operational Bio & Responsibilities
              </span>
              <p className="text-slate-300 text-xs leading-relaxed">
                {profile?.bio || 'Managing real-time telemetry, geofence corridors, and dispatch logistics.'}
              </p>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Department</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Designation</label>
                <input
                  type="text"
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 block mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={editForm.emergencyContact}
                  onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-slate-400 block mb-1">Operational Bio</label>
                <textarea
                  rows="3"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Security & Vault Overview Sub-panel */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h3 className="font-bold text-slate-100 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security Privileges & Active Session
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Secondary Vault</span>
              <span
                className={`font-black text-xs inline-block mt-1 ${
                  secondaryToken ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {secondaryToken ? 'Unlocked & Active' : 'Locked (PIN Required)'}
              </span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Two-Factor Auth</span>
              <span className="font-black text-xs text-emerald-400 inline-block mt-1">Enforced (Active)</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Session Clock</span>
              <span className="font-mono text-xs text-cyan-400 font-bold inline-block mt-1">{sessionTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-left">
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" /> Update Account Password
            </h3>

            {passwordError && (
              <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                  }}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

