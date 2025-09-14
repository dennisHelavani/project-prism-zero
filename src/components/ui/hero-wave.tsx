
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
    let time = 0;
    let lastTime = 0;

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
        const t = time * waveConfig.speed;
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
      if (lastTime === 0) lastTime = timestamp;
      const deltaTime = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      time += deltaTime;

      ctx.clearRect(0, 0, width, height);
      
      // Draw wave and reflection
      drawWave(false);
      drawWave(true);
      
      // Fade edges
      ctx.save();
      const fadeWidth = width * waveConfig.fadeEdgePct;
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'rgba(10, 10, 10, 0)');
      gradient.addColorStop(0.5, 'rgba(10, 10, 10, 1)');
      gradient.addColorStop(1, 'rgba(10, 10, 10, 0)');
      
      const gradientMask = ctx.createLinearGradient(0, 0, width, 0);
      gradientMask.addColorStop(0, 'transparent');
      gradientMask.addColorStop(waveConfig.fadeEdgePct, 'white');
      gradientMask.addColorStop(1 - waveConfig.fadeEdgePct, 'white');
      gradientMask.addColorStop(1, 'transparent');
      
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = gradientMask;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      if (!prefersReducedMotion) {
        animationFrameId.current = requestAnimationFrame(render);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!animationFrameId.current) {
          lastTime = 0;
          animationFrameId.current = requestAnimationFrame(render);
        }
      } else {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = undefined;
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    window.addEventListener('resize', resize);
    resize();

    // Initial render for reduced motion or static fallback
    requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
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
