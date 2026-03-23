"use client";

import { useEffect, useRef } from "react";

export default function P5Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateSize = () => {
      canvas.width = canvas.offsetWidth || 800;
      canvas.height = canvas.offsetHeight || 600;
    };
    updateSize();

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      hue: number;
      alpha: number;
      size: number;
      life: number;
    }

    const particles: Particle[] = [];
    const W = canvas.width;
    const H = canvas.height;

    function noise(x: number, y: number, t: number) {
      return (
        Math.sin(x * 0.01 + t * 0.3) * Math.cos(y * 0.012 + t * 0.2) +
        Math.sin(x * 0.018 + y * 0.015 + t * 0.1) * 0.5
      );
    }

    for (let i = 0; i < 300; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: 0,
        vy: 0,
        hue: 25 + Math.random() * 20,
        alpha: Math.random() * 0.3 + 0.05,
        size: Math.random() * 2 + 0.5,
        life: Math.random() * 200 + 50,
      });
    }

    let t = 0;
    const animate = () => {
      ctx.fillStyle = "rgba(17, 16, 16, 0.05)";
      ctx.fillRect(0, 0, W, H);

      particles.forEach((p, i) => {
        const angle = noise(p.x, p.y, t) * Math.PI * 2;
        p.vx = p.vx * 0.95 + Math.cos(angle) * 0.5;
        p.vy = p.vy * 0.95 + Math.sin(angle) * 0.5;
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        if (p.life <= 0) {
          particles[i] = {
            x: Math.random() * W,
            y: Math.random() * H,
            vx: 0,
            vy: 0,
            hue: 25 + Math.random() * 20,
            alpha: Math.random() * 0.3 + 0.05,
            size: Math.random() * 2 + 0.5,
            life: Math.random() * 200 + 50,
          };
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 40%, 55%, ${p.alpha})`;
        ctx.fill();
      });

      t += 0.003;
      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}
