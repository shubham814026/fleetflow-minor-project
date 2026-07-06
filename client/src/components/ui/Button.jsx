import { motion } from 'framer-motion';
import { useState } from 'react';

const variantStyles = {
  primary:
    'bg-fleet-oxford text-white shadow-lg shadow-fleet-oxford/25 hover:bg-fleet-navy',
  secondary:
    'border border-fleet-tan bg-fleet-tan/35 text-fleet-navy hover:bg-fleet-tan/50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70',
  danger:
    'bg-rose-600 text-white shadow-lg shadow-rose-500/25 hover:bg-rose-700'
};

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const [ripple, setRipple] = useState(null);

  const handleRipple = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setRipple({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      id: Date.now()
    });
    if (onClick) onClick(event);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      type={type}
      disabled={disabled}
      onClick={handleRipple}
      className={`group relative overflow-hidden rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {ripple && (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.45 }}
          animate={{ scale: 8, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="pointer-events-none absolute h-6 w-6 rounded-full bg-white/70"
          style={{ left: ripple.x - 12, top: ripple.y - 12 }}
          onAnimationComplete={() => setRipple(null)}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default Button;
