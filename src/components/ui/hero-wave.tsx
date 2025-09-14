
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

const waveConfig = {
  amplitude: 28,
  amplitudeJitter: 4,
  wavelength: 520,
  wavelength2: 280,
  speed: 0.22,
  verticalDriftPx: 6,
  glowPx: 26,
  coreWidth: 2.0,
  glowWidth: 7.0,
  reflection: {
    opacity: 0.22,
    blur: 40,
    offsetY: 22,
    width: 8.0,
  },
  fadeEdgePct: 0.08,
};

const colors = {
  core: 'rgba(255,255,255,0.9)',
  glow: 'rgba(255,255,255,0.35)',
  reflection: 'rgba(255,255,255,0.22)',
};


export function HeroWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationFrameId = useRef<number>();
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let dpr = 1;
    let isRunning = false;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };

    const draw = (time: number) => {
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        ctx.clearRect(0, 0, w, h);
    
        const { amplitude, wavelength, wavelength2, speed, reflection } = waveConfig;
        const phase = time * 0.001 * speed;
        const baseY = h * 0.5;
    
        const buildPath = (y0: number, flip = false) => {
            ctx.beginPath();
            let hasMoved = false;
            for (let x = -2; x <= w + 2; x += 2) {
                const y = y0 + 
                    amplitude * Math.sin((x / wavelength) * Math.PI * 2 + phase) + 
                    (amplitude / 3) * Math.sin((x / wavelength2) * Math.PI * 2 - phase * 0.6);
                const finalY = flip ? y0 + (y0 - y) : y;
                if (!hasMoved) {
                    ctx.moveTo(x, finalY);
                    hasMoved = true;
                } else {
                    ctx.lineTo(x, finalY);
                }
            }
        };
    
        // --- Main Wave ---
        // Glow
        ctx.save();
        buildPath(baseY);
        ctx.strokeStyle = colors.glow;
        ctx.lineWidth = waveConfig.glowWidth;
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = waveConfig.glowPx;
        ctx.stroke();
        ctx.restore();
    
        // Core
        ctx.save();
        buildPath(baseY);
        ctx.strokeStyle = colors.core;
        ctx.lineWidth = waveConfig.coreWidth;
        ctx.stroke();
        ctx.restore();
    
        // --- Reflection ---
        ctx.save();
        buildPath(baseY + reflection.offsetY, true);
        ctx.strokeStyle = colors.reflection;
        ctx.lineWidth = reflection.width;
        ctx.shadowColor = colors.reflection;
        ctx.shadowBlur = reflection.blur;
        ctx.globalAlpha = reflection.opacity;
        ctx.stroke();
        ctx.restore();
    
        // --- Edge Fade Mask ---
        ctx.save();
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, 'rgba(10,10,10,0)');
        gradient.addColorStop(waveConfig.fadeEdgePct, 'rgba(10,10,10,1)');
        gradient.addColorStop(1 - waveConfig.fadeEdgePct, 'rgba(10,10,10,1)');
        gradient.addColorStop(1, 'rgba(10,10,10,0)');
        ctx.globalCompositeOperation = 'destination-in';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    };

    const loop = (time: number) => {
      draw(time);
      if (isRunning) {
        animationFrameId.current = requestAnimationFrame(loop);
      }
    };
    
    const startAnimation = () => {
      if (!isRunning) {
        isRunning = true;
        if (prefersReducedMotion) {
            draw(0);
        } else {
            animationFrameId.current = requestAnimationFrame(loop);
        }
      }
    };

    const stopAnimation = () => {
      isRunning = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = undefined;
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        startAnimation();
      } else {
        stopAnimation();
      }
    }, { rootMargin: "0px 0px 0px 0px", threshold: 0 });

    observer.observe(container);
    window.addEventListener('resize', resize, { passive: true });
    resize();

    return () => {
      stopAnimation();
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };

  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="hero-wave-container absolute inset-0 -z-10 bg-hero-gradient"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="hero-wave w-full h-full" />
    </div>
  );
}
