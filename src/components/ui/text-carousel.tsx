'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import './text-carousel.css';

interface TextCarouselProps {
  items: string[];
  className?: string;
  itemClassName?: string;
}

export function TextCarousel({ items, className, itemClassName }: TextCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(interval);
  }, [items.length]);

  return (
    <div className={cn("text-carousel-container", className)}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ ease: 'easeInOut', duration: 0.5 }}
          className={cn("text-carousel-item", itemClassName)}
        >
          {items[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
