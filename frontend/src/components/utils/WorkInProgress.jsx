import { motion } from 'framer-motion';

const WorkInProgress = () => {
  return (
    <motion.div
      className="fixed z-50 bottom-4 right-4 px-6 py-3 bg-theme backdrop-blur-sm rounded-full flex items-center space-x-2 shadow-lg border border-purple-400/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{ rotate: [0, 20, -20, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        🚧
      </motion.div>
      <span className="text-white">Working on it - Update coming soon!</span>
    </motion.div>
  );
};

export default WorkInProgress;