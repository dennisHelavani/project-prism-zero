
'use client';

import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MotionDivProps extends HTMLMotionProps<'div'> {
  delay?: number;
  variants?: Variants;
}

export const MotionDiv = ({
  children,
  className,
  delay = 0,
  variants,
  ...props
}: MotionDivProps) => {
  const defaultVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  
  const finalVariants = variants || defaultVariants;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, delay }}
      variants={finalVariants}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
