import React from 'react';
import { motion } from 'framer-motion';
import { LuPanelLeftClose, LuPanelLeftOpen } from 'react-icons/lu';
import { NavLink } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const Sidebar = ({ items, collapsed, onToggle }) => {
  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="sticky top-4 h-[calc(100vh-2rem)] flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-3 shadow-2xl backdrop-blur-xl z-30 shrink-0"
    >
      {/* Sidebar Header / Logo */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 truncate">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-amber-400 rounded-xl text-slate-950 font-black shadow-md shadow-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h1 className="font-extrabold text-sm text-slate-100 tracking-tight leading-none">SmartFleet AI</h1>
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest">Enterprise</span>
            </div>
          </div>
        )}

        <button
          onClick={onToggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/70 bg-slate-800/80 text-slate-300 transition hover:bg-slate-700/80 hover:text-white shrink-0 mx-auto"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <LuPanelLeftOpen size={18} /> : <LuPanelLeftClose size={18} />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
