const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-fleet-tan/70 bg-fleet-cream/80 px-3 py-2 text-sm text-fleet-oxford shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-fleet-tanVivid">
      <span className="relative h-5 w-5">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-fleet-tan/40 border-t-fleet-oxford dark:border-slate-700 dark:border-t-fleet-tanVivid" />
        <span className="absolute inset-1 animate-ping rounded-full bg-fleet-tan/30" />
      </span>
      {text}
    </div>
  );
};

export default Loader;
