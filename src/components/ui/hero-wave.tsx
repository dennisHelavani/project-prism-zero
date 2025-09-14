
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
  cycleSec: 14,
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
  const isRunning = useRef(true);
  const time = useRef(0);
  const lastTime = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      width = containerRef.current?.offsetWidth || 0;
      height = containerRef.current?.offsetHeight || 0;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    const drawWave = (isReflection: boolean) => {
      const baseY = height / 2;
      const {
        amplitude, amplitudeJitter, wavelength, wavelength2, verticalDriftPx,
        reflection
      } = waveConfig;

      ctx.save();

      if (isReflection) {
        ctx.globalAlpha = reflection.opacity;
        ctx.filter = `blur(${reflection.blur / dpr}px)`;
        ctx.translate(0, baseY + reflection.offsetY);
        ctx.scale(1, -1);
        ctx.translate(0, -baseY);
      }

      ctx.beginPath();
      for (let x = -5; x < width + 5; x++) {
        const t = time.current * waveConfig.speed;
        const phase1 = (x / wavelength) * 2 * Math.PI + t;
        const phase2 = (x / wavelength2) * 2 * Math.PI - t * 0.6;
        const drift = Math.sin(t * 0.3) * verticalDriftPx;

        const y =
          baseY +
          (amplitude + Math.sin(t * 0.5) * amplitudeJitter) * Math.sin(phase1) +
          (amplitude / 3) * Math.sin(phase2) +
          drift;

        ctx.lineTo(x, y);
      }

      if (isReflection) {
        ctx.strokeStyle = colors.reflection;
        ctx.lineWidth = reflection.width;
      } else {
        // Glow pass
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = waveConfig.glowPx;
        ctx.strokeStyle = colors.glow;
        ctx.lineWidth = waveConfig.glowWidth;
        ctx.stroke();

        // Core pass
        ctx.shadowBlur = 0;
        ctx.strokeStyle = colors.core;
        ctx.lineWidth = waveConfig.coreWidth;
      }

      ctx.stroke();
      ctx.restore();
    };

    const render = (timestamp: number) => {
      if (lastTime.current === 0) lastTime.current = timestamp;
      const deltaTime = (timestamp - lastTime.current) / 1000;
      lastTime.current = timestamp;
      
      if (isRunning.current && !prefersReducedMotion) {
        time.current += deltaTime;
      }

      ctx.clearRect(0, 0, width, height);
      
      drawWave(false);
      drawWave(true);
      
      const fadeWidth = width * waveConfig.fadeEdgePct;
      const gradientMask = ctx.createLinearGradient(0, 0, width, 0);
      gradientMask.addColorStop(0, 'transparent');
      gradientMask.addColorStop(waveConfig.fadeEdgePct, 'white');
      gradientMask.addColorStop(1 - waveConfig.fadeEdgePct, 'white');
      gradientMask.addColorStop(1, 'transparent');
      
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = gradientMask;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';

      if (isRunning.current) {
        animationFrameId.current = requestAnimationFrame(render);
      }
    };

    const startAnimation = () => {
      if (!isRunning.current) {
        isRunning.current = true;
        lastTime.current = 0; // Reset time to avoid jump
        animationFrameId.current = requestAnimationFrame(render);
      }
    }
    
    const stopAnimation = () => {
        isRunning.current = false;
        if(animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = undefined;
        }
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        startAnimation();
      } else {
        stopAnimation();
      }
    }, { threshold: 0.1 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    window.addEventListener('resize', resize);
    resize();
    startAnimation();

    return () => {
      window.removeEventListener('resize', resize);
      stopAnimation();
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="hero-wave-container absolute inset-0 -z-10 bg-hero-gradient"
      aria-hidden="true"
      role="presentation"
    >
      <canvas ref={canvasRef} className="hero-wave" />
    </div>
  );
}
