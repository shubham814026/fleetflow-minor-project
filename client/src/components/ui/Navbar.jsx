import { Link } from 'react-router-dom';
import Button from './Button';

const Navbar = ({ role, onLogout }) => {
  return (
    <header className="sticky top-4 z-30 mb-1 rounded-2xl border border-slate-700/70 bg-slate-900/70 px-4 py-3.5 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="text-lg font-semibold text-slate-100">
            FleetFlow
          </Link>
          <span className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-200">
            {role}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
