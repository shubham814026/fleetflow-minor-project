import { motion } from 'framer-motion';

const styles = {
  Available: 'bg-fleet-tan/35 text-fleet-oxford dark:bg-fleet-tan/20 dark:text-fleet-tanVivid ring-fleet-tan/40',
  'On Trip': 'bg-fleet-oxford/12 text-fleet-oxford dark:bg-fleet-oxford/35 dark:text-fleet-tanVivid ring-fleet-oxford/25',
  'In Shop': 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30',
  Suspended: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-500/30',
  'Out of Service': 'bg-slate-500/15 text-slate-700 dark:text-slate-300 ring-slate-400/25',
  'On Duty': 'bg-fleet-tan/35 text-fleet-oxford dark:bg-fleet-tan/20 dark:text-fleet-tanVivid ring-fleet-tan/40',
  'Off Duty': 'bg-slate-500/15 text-slate-700 dark:text-slate-300 ring-slate-400/25',
  Draft: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 ring-slate-400/25',
  Dispatched: 'bg-fleet-oxford/12 text-fleet-oxford dark:bg-fleet-oxford/35 dark:text-fleet-tanVivid ring-fleet-oxford/25',
  Completed: 'bg-fleet-tan/35 text-fleet-oxford dark:bg-fleet-tan/20 dark:text-fleet-tanVivid ring-fleet-tan/40',
  Cancelled: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-500/30'
};

const pulseStyles = {
  Available: 'before:bg-fleet-tan',
  'On Trip': 'before:bg-fleet-oxford',
  'In Shop': 'before:bg-amber-400',
  Suspended: 'before:bg-rose-500 animate-pulse',
  Dispatched: 'before:bg-fleet-oxford',
  Completed: 'before:bg-fleet-tan'
};

const StatusBadge = ({ status }) => {
  const base = styles[status] || 'bg-slate-500/10 text-slate-700 ring-slate-400/20 dark:text-slate-300';
  const pulse = pulseStyles[status] || 'before:bg-slate-400';

  return (
    <motion.span
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      className={`relative inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${base} ${pulse}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 before:absolute before:inset-0 before:rounded-full" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-current/80" />
      </span>
      {status}
    </motion.span>
  );
};

export default StatusBadge;
