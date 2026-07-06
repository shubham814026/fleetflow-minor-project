import { LuMoon, LuSun } from 'react-icons/lu';
import { Link } from 'react-router-dom';
import Button from './Button';

const Navbar = ({ role, isDark, onToggleTheme, onLogout }) => {
  return (
    <header className="sticky top-4 z-30 mb-1 rounded-2xl border border-fleet-tan/70 bg-fleet-cream/80 px-4 py-3.5 shadow-xl shadow-fleet-oxford/10 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/70 dark:shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="text-lg font-semibold text-fleet-oxford dark:text-slate-100">
            FleetFlow
          </Link>
          <span className="rounded-full border border-fleet-tan bg-fleet-tan/35 px-3 py-1 text-xs font-medium text-fleet-oxford dark:text-slate-100">
            {role}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-fleet-tan bg-fleet-tan/25 text-fleet-oxford transition hover:scale-105 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            aria-label="Toggle dark mode"
          >
            {isDark ? <LuSun /> : <LuMoon />}
          </button>
          <Button variant="secondary" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
