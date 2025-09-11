
'use client';
import { motion } from 'framer-motion';

export function DocumentVisual() {
  return (
    <motion.div 
      className="relative w-32 h-32 flex flex-col items-center justify-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ staggerChildren: 0.3 }}
    >
      {/* Document Icon */}
      <motion.div 
        className="relative"
        variants={{
            hidden: { y: 0, opacity: 0 },
            visible: { y: -10, opacity: 1, transition: { duration: 0.5, delay: 0.2 } }
        }}
      >
        <svg
          width="60"
          height="75"
          viewBox="0 0 60 75"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Doc Body */}
          <path
            d="M5 0H38.7857L55 16.5V70C55 72.7614 52.7614 75 50 75H10C7.23858 75 5 72.7614 5 70V0Z"
            fill="white"
          />
          {/* Folded Corner */}
          <path d="M38 0L55 17H43C40.2386 17 38 14.7614 38 12V0Z" fill="#E2E8F0" />
           {/* Brand Stripe */}
          <rect y="0" width="5" height="75" fill="hsl(var(--foreground))" />
        </svg>
      </motion.div>

      {/* Down Arrow */}
      <motion.div
        variants={{
            hidden: { opacity: 0, y: -5 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.8 } }
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
      </motion.div>

      {/* Envelope Icon */}
      <motion.div
        variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 1.2 } }
        }}
      >
        <svg width="60" height="40" viewBox="0 0 60 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
          <path d="M4 4h52v32H4z"></path>
          <polyline points="4 4 30 22 56 4"></polyline>
        </svg>
      </motion.div>
    </motion.div>
  );
}
