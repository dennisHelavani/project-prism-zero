
'use client';
import { motion } from 'framer-motion';

export function FormVisual() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      className="relative w-32 h-32"
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        variants={itemVariants}
      >
        <motion.rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx="8"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          fill="hsl(var(--background))"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        <motion.line
          x1="25" y1="30" x2="75" y2="30"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          variants={itemVariants}
        />
        <motion.line
          x1="25" y1="50" x2="75" y2="50"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          variants={itemVariants}
        />
        <motion.line
          x1="25" y1="70" x2="60" y2="70"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          variants={itemVariants}
        />
      </motion.svg>

      <motion.div
        className="absolute bottom-1 right-1"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ 
          scale: 1, 
          rotate: 0, 
          transition: { delay: 1, type: 'spring', stiffness: 200 } 
        }}
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <motion.circle 
            cx="12" cy="12" r="11" 
            fill="transparent"
            stroke="#22c55e" 
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, transition: { duration: 0.4, delay: 1.2 } }}
          />
          <motion.path
            d="M8 12.5l3 3 5-5"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="transparent"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, transition: { duration: 0.3, delay: 1.4 } }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
