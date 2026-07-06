import { motion } from 'framer-motion';
import { LuPanelLeftClose, LuPanelLeftOpen } from 'react-icons/lu';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ items, collapsed, onToggle }) => {
  return (
    <motion.aside
      animate={{ width: collapsed ? 86 : 248 }}
      transition={{ duration: 0.24, ease: 'easeInOut' }}
      className="sticky top-5 h-[calc(100vh-2.5rem)] overflow-hidden rounded-2xl border border-fleet-tan/70 bg-fleet-cream/80 p-3 shadow-xl shadow-fleet-oxford/10 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/70 dark:shadow-black/20"
    >
      <button
        onClick={onToggle}
        className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-fleet-tan bg-fleet-tan/30 text-fleet-oxford transition hover:bg-fleet-tan/45 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <LuPanelLeftOpen size={16} /> : <LuPanelLeftClose size={16} />}
      </button>
      <nav className="space-y-1.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-fleet-oxford text-white shadow-md shadow-fleet-oxford/30'
                  : 'text-fleet-oxford hover:bg-fleet-tan/25 dark:text-slate-300 dark:hover:bg-slate-800/70'
              }`
            }
          >
            <item.icon className="text-base" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
