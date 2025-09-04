"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type SparklesCoreProps = {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
};

export const SparklesCore = (props: SparklesCoreProps) => {
  const {
    id,
    background,
    minSize,
    maxSize,
    particleDensity,
    className,
    particleColor,
  } = props;
  const [sparkles, setSparkles] = useState<any[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const count = particleDensity ? canvas.width * particleDensity / 1000 : 0;
          const newSparkles = Array.from({ length: count }).map(() => {
            return {
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              size: Math.random() * (maxSize || 1 - (minSize || 0.4)) + (minSize || 0.4),
              alpha: Math.random() * 0.5 + 0.5,
              speed: Math.random() * 2,
            };
          });
          setSparkles(newSparkles);
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [particleDensity, minSize, maxSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        let animationFrameId: number;
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          sparkles.forEach((sparkle) => {
            sparkle.y -= sparkle.speed;
            if (sparkle.y < 0) {
              sparkle.y = canvas.height;
            }
            ctx.beginPath();
            ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, 2 * Math.PI, false);
            ctx.fillStyle = `rgba(${particleColor ? parseInt(particleColor.slice(1, 3), 16) : 255}, ${particleColor ? parseInt(particleColor.slice(3, 5), 16) : 255}, ${particleColor ? parseInt(particleColor.slice(5, 7), 16) : 255}, ${sparkle.alpha})`;
            ctx.fill();
          });
          animationFrameId = window.requestAnimationFrame(animate);
        };
        animate();
        return () => {
          window.cancelAnimationFrame(animationFrameId);
        };
      }
    }
  }, [sparkles, particleColor]);

  return (
    <div className={cn("relative w-full h-full", className)}>
      <canvas
        id={id}
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          background: background || "transparent",
        }}
      ></canvas>
    </div>
  );
};
