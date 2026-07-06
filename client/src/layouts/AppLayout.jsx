import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Fuel,
  LayoutDashboard,
  ShieldCheck,
  Truck,
  Waypoints
} from 'lucide-react';
import Sidebar from '../components/ui/Sidebar';
import Navbar from '../components/ui/Navbar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { pageTransition } from '../animations/pageTransitions';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vehicles', label: 'Vehicle Registry', icon: Truck },
  { to: '/trips', label: 'Trip Dispatcher', icon: Waypoints },
  { to: '/maintenance', label: 'Maintenance', icon: ShieldCheck },
  { to: '/expenses', label: 'Expense & Fuel', icon: Fuel },
  { to: '/drivers', label: 'Drivers', icon: Activity },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 }
];

const navAccess = {
  '/dashboard': ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'],
  '/vehicles': ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'],
  '/trips': ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'],
  '/maintenance': ['Fleet Manager', 'Safety Officer', 'Financial Analyst'],
  '/expenses': ['Fleet Manager', 'Financial Analyst'],
  '/drivers': ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'],
  '/analytics': ['Fleet Manager', 'Financial Analyst']
};

const AppLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const allowedNavItems = navItems.filter((item) => navAccess[item.to]?.includes(user?.role));

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f7ead6] via-[#e0c39b] to-[#c89f70] px-4 py-5 transition-colors duration-300 dark:from-[#040913] dark:via-[#071227] dark:to-[#0c1d37]">
      <div className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-fleet-tan/45 blur-3xl dark:bg-fleet-oxford/45" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fleet-oxford/25 blur-3xl dark:bg-fleet-tanVivid/20" />

      <div className="relative mx-auto grid max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-[auto_1fr]">
        <Sidebar items={allowedNavItems} collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />

        <section className="space-y-6">
          <Navbar role={user?.role || 'User'} isDark={isDark} onToggleTheme={toggleTheme} onLogout={logout} />
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={pageTransition.initial}
              animate={pageTransition.animate}
              exit={pageTransition.exit}
              transition={pageTransition.transition}
              className="space-y-4"
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
