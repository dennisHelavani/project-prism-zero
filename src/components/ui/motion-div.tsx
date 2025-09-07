
'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MotionDivProps extends HTMLMotionProps<'div'> {
  delay?: number;
}

export const MotionDiv = ({
  children,
  className,
  delay = 0,
  ...props
}: MotionDivProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
