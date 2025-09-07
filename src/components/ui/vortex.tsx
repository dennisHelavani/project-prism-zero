"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { createNoise3D } from "simplex-noise";

export const Vortex = ({
  children,
  className,
  containerClassName,
  particleCount = 700,
  rangeY = 100,
  baseHue = 220,
  baseSpeed = 0.0,
  rangeSpeed = 1.5,
  baseRadius = 1,
  rangeRadius = 2,
  backgroundColor = "black",
}: {
  children?: any;
  className?: string;
  containerClassName?: string;
  particleCount?: number;
  rangeY?: number;
  baseHue?: number;
  baseSpeed?: number;
  rangeSpeed?: number;
  baseRadius?: number;
  rangeRadius?: number;
  backgroundColor?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particle = useRef<any[]>([]);
  const noise3D = createNoise3D();
  const center = useRef([0, 0]);
  const tick = useRef(0);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container) {
      const Dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
      canvas.width = rect.width * Dpr;
      canvas.height = rect.height * Dpr;
      canvas.getContext("2d")?.scale(Dpr, Dpr);
    }
  }, [containerRef]);

  useEffect(() => {
    const part = [];
    for (let i = 0; i < particleCount; i++) {
      part.push({
        x: dimensions.width / 2,
        y: dimensions.height / 2,
        vx: 0,
        vy: 0,
        radius: baseRadius + Math.random() * rangeRadius,
        speed: baseSpeed + Math.random() * rangeSpeed,
        hue: baseHue,
        alpha: Math.random(),
      });
    }
    particle.current = part;
  }, [
    dimensions,
    particleCount,
    baseRadius,
    rangeRadius,
    baseSpeed,
    rangeSpeed,
    baseHue,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const draw = () => {
      tick.current++;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particle.current.forEach((p) => {
        const noise = noise3D(
          (p.x * 0.001) / 2,
          (p.y * 0.001) / 2,
          tick.current * 0.0001
        );
        const angle = Math.PI * 2 * noise;
        p.vx = Math.cos(angle) * p.speed;
        p.vy = Math.sin(angle) * p.speed;

        p.x += p.vx;
        p.y += p.vy;

        if (
          p.x < 0 ||
          p.x > canvas.width ||
          p.y < 0 ||
          p.y > canvas.height
        ) {
          p.x = canvas.width / 2;
          p.y = canvas.height / 2;
        }

        ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = window.requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [noise3D, backgroundColor, dimensions]);

  return (
    <div className={cn("relative h-full w-full", containerClassName)}>
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundColor: backgroundColor }}
      >
        <canvas ref={canvasRef} className="h-full w-full"></canvas>
      </div>
      <div ref={containerRef} className={cn("relative z-10", className)}>
        {children}
      </div>
    </div>
  );
};
