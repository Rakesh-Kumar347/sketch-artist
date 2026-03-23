"use client";
import { useState, useEffect, useRef } from "react";

export function useMouseParallax(strength = 0.05) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * strength,
        y: (e.clientY / window.innerHeight - 0.5) * strength,
      };
    };

    const animate = () => {
      setPosition((prev) => ({
        x: prev.x + (targetRef.current.x - prev.x) * 0.1,
        y: prev.y + (targetRef.current.y - prev.y) * 0.1,
      }));
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [strength]);

  return position;
}
