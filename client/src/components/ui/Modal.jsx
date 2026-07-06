import { AnimatePresence, motion } from 'framer-motion';

const Modal = ({ open, title, description, children, onClose }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/80"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
            {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
            <div className="mt-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
