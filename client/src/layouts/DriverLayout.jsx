import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Navigation, MapPin, History, User, AlertOctagon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import OfflineBanner from '../components/OfflineBanner';

export default function DriverLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/driver/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans max-w-md mx-auto relative shadow-2xl border-x border-slate-800">
      <OfflineBanner />

      {/* Driver Mobile Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md shadow-amber-500/20">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DR'}
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 leading-tight">{user?.name || 'Driver Console'}</h2>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Duty
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick SOS Trigger Button */}
          <NavLink
            to="/driver/sos"
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg shadow-rose-600/30 animate-bounce"
          >
            <AlertOctagon className="w-3.5 h-3.5" /> SOS
          </NavLink>

          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        <Outlet />
      </main>

      {/* Driver Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-3 py-2 flex items-center justify-around">
        <NavLink
          to="/driver/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
              isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/driver/trip"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
              isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Navigation className="w-5 h-5" />
          <span>Active Trip</span>
        </NavLink>

        <NavLink
          to="/driver/map"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
              isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <MapPin className="w-5 h-5" />
          <span>Map</span>
        </NavLink>

        <NavLink
          to="/driver/history"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
              isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <History className="w-5 h-5" />
          <span>History</span>
        </NavLink>

        <NavLink
          to="/driver/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
              isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}
