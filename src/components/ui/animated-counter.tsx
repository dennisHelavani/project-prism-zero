
'use client';

import { animate, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

type AnimatedCounterProps = {
  from: number;
  to: number;
  animationOptions?: {
    duration?: number;
    ease?: any;
  };
};

export function AnimatedCounter({ from, to, animationOptions }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    const element = ref.current;

    if (!element) return;
    if (!inView) return;

    element.textContent = String(from);

    const controls = animate(from, to, {
      duration: 1.5,
      ease: 'easeOut',
      ...animationOptions,
      onUpdate(value) {
        element.textContent = value.toFixed(0);
      },
    });

    return () => controls.stop();
  }, [ref, inView, from, to, animationOptions]);

  return <span ref={ref} />;
}
