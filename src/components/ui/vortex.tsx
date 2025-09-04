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
  const containerRef = useRef(null);
  const particle = useRef<any[]>([]);
  const noise3D = createNoise3D();
  const center = useRef([0, 0]);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (canvas && container) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const resize = () => {
          const {
            width,
            height,
          } = (container as HTMLElement).getBoundingClientRect();
          canvas.width = width;
          canvas.height = height;
          center.current = [width / 2, height / 2];
        };
        resize();
        window.addEventListener("resize", resize);

        const createParticles = () => {
          particle.current = [];
          for (let i = 0; i < particleCount; i++) {
            const r =
              (canvas.width + canvas.height) / 2 -
              Math.random() * ((canvas.width + canvas.height) / 2);
            const theta = Math.random() * 2 * Math.PI;
            particle.current.push({
              x: center.current[0] + r * Math.cos(theta),
              y: center.current[1] + r * Math.sin(theta),
              vx: 0,
              vy: 0,
            });
          }
        };
        createParticles();

        const draw = () => {
          tick.current++;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          particle.current.forEach((p) => {
            const noise = noise3D(p.x / 100, p.y / 100, tick.current / 1000);
            const angle = noise * 2 * Math.PI;
            const speed = baseSpeed + rangeSpeed * Math.random();
            p.vx += Math.cos(angle) * speed;
            p.vy += Math.sin(angle) * speed;
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.95;
            p.vy *= 0.95;

            const dist = Math.sqrt(
              Math.pow(p.x - center.current[0], 2) +
                Math.pow(p.y - center.current[1], 2)
            );
            if (
              p.x < 0 ||
              p.x > canvas.width ||
              p.y < 0 ||
              p.y > canvas.height ||
              dist > (canvas.width + canvas.height) / 2
            ) {
              const r =
                (canvas.width + canvas.height) / 2 -
                Math.random() * ((canvas.width + canvas.height) / 2);
              const theta = Math.random() * 2 * Math.PI;
              p.x = center.current[0] + r * Math.cos(theta);
              p.y = center.current[1] + r * Math.sin(theta);
              p.vx = 0;
              p.vy = 0;
            }

            const radius = baseRadius + rangeRadius * Math.random();
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = `hsla(${
              baseHue + noise * 50
            }, 100%, 50%, ${1})`;
            ctx.fill();
          });

          window.requestAnimationFrame(draw);
        };
        draw();

        return () => {
          window.removeEventListener("resize", resize);
        };
      }
    }
  }, []);

  return (
    <div className={cn("relative h-full w-full", containerClassName)}>
      <canvas ref={canvasRef} className="absolute h-full w-full "></canvas>
      <div ref={containerRef} className={cn("relative z-10", className)}>
        {children}
      </div>
    </div>
  );
};
