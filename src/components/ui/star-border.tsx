'use client';

import React from 'react';
import './star-border.css';
import { cn } from '@/lib/utils';

interface StarBorderProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: React.ElementType;
  color?: string;
  speed?: string;
  thickness?: number;
  children: React.ReactNode;
}

export const StarBorder = ({
  as: Component = 'button',
  className = '',
  color = '#FABE2C', 
  speed = '6s',
  thickness = 1,
  children,
  ...rest
}: StarBorderProps) => {
  return (
    <Component
      className={cn("star-border-container flip-text-wrapper", className)}
      style={{
        padding: `${thickness}px`,
        ...rest.style,
      }}
      {...rest}
    >
      <div
        className="border-gradient-bottom"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 20%)`,
          animationDuration: speed,
        }}
      ></div>
      <div
        className="border-gradient-top"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 20%)`,
          animationDuration: speed,
        }}
      ></div>
      <div className="inner-content">
        <span className="flip-text-inner">{children}</span>
      </div>
    </Component>
  );
};
