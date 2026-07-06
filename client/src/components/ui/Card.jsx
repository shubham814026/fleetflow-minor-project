import { motion } from 'framer-motion';
import { useState } from 'react';

const Card = ({ children, className = '', glow = false }) => {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');

  const onMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -2;
    const rotateY = ((x / rect.width) - 0.5) * 2;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };

  const reset = () => setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={reset}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{ transform }}
      className={`relative rounded-2xl border border-fleet-tan/70 bg-fleet-cream/80 p-4 shadow-xl shadow-fleet-oxford/10 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/65 dark:shadow-black/20 ${className}`}
    >
      {glow && <div className="pointer-events-none absolute inset-0 rounded-2xl bg-fleet-tan/10 dark:bg-fleet-oxford/15" />}
      <div className="relative">{children}</div>
    </motion.div>
  );
};

export default Card;
