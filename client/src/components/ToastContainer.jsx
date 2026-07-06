import { AnimatePresence, motion } from 'framer-motion';

const colorMap = {
  success: 'border-fleet-tan/80 bg-fleet-tan/35 text-fleet-oxford dark:text-fleet-tanVivid',
  error: 'border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300',
  info: 'border-fleet-oxford/40 bg-fleet-oxford/10 text-fleet-oxford dark:text-fleet-tanVivid'
};

const ToastContainer = ({ toasts }) => {
  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`${colorMap[toast.type]} rounded-xl border px-4 py-2 text-sm shadow-lg backdrop-blur-xl`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
