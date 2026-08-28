import React, { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  Truck,
  Users,
  Waypoints,
  Fuel,
  Activity,
  AlertTriangle,
  TrendingUp,
  Shield,
  Wrench,
  Navigation,
  FileText,
  BookOpen,
  Leaf,
  FileBarChart,
  DollarSign,
  ClipboardList,
  Settings,
  User,
  Map,
  ShieldCheck
} from 'lucide-react';
import Sidebar from '../components/ui/Sidebar';
import Navbar from '../components/ui/Navbar';
import OfflineBanner from '../components/OfflineBanner';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

export const ADMIN_NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/live-map', label: 'Live Map', icon: MapPin },
  { to: '/vehicles', label: 'Vehicles', icon: Truck },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/trips', label: 'Trips', icon: Waypoints },
  { to: '/fuel', label: 'Fuel & Cost', icon: Fuel },
  { to: '/utilisation', label: 'Utilisation', icon: Activity },
  { to: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { to: '/forecast', label: 'Forecast', icon: TrendingUp },
  { to: '/geofencing', label: 'Geofencing', icon: Map },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/safety', label: 'Safety', icon: Shield },
  { to: '/routes', label: 'Routes', icon: Navigation },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/logbook', label: 'Logbook', icon: BookOpen },
  { to: '/carbon', label: 'Carbon', icon: Leaf },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/salary', label: 'Salary', icon: DollarSign },
  { to: '/audit-logs', label: 'Audit Logs', icon: ClipboardList },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/profile', label: 'Profile', icon: User }
];

const AppLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  // If driver tries to access admin layout, redirect to driver PWA dashboard
  if (user && user.role === 'Driver') {
    return <Navigate to="/driver/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
      <OfflineBanner />
      
      {/* Background Decorative Glows */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="pointer-events-none fixed top-1/2 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="relative mx-auto grid max-w-[1600px] grid-cols-1 gap-4 p-3 md:p-5 lg:grid-cols-[auto_1fr]">
        <Sidebar items={ADMIN_NAV_ITEMS} collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />

        <section className="space-y-4 min-w-0">
          <Navbar role={user?.role || 'Super Admin'} isDark={isDark} onToggleTheme={toggleTheme} onLogout={logout} />
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="min-h-[calc(100vh-8rem)]"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};

export default AppLayout;
