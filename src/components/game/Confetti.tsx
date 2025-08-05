"use client";

import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  opacity: number;
}

const colors = ["#4285F4", "#FF9800", "#34A853", "#EA4335", "#FFFFFF"];

export const Confetti: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * window.innerHeight,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: Math.random() * 4 - 2,
      vy: Math.random() * 5 + 2,
      opacity: 1,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
        setParticles([]);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (particles.length === 0) return;

    const animationFrame = requestAnimationFrame(() => {
      setParticles(prevParticles => {
        return prevParticles.map(p => {
          const newY = p.y + p.vy;
          const newX = p.x + p.vx;
          
          if (newY > window.innerHeight) {
            return {
              ...p,
              y: -20,
              x: Math.random() * window.innerWidth,
              opacity: 1,
            };
          }

          return {
            ...p,
            y: newY,
            x: newX,
            vy: p.vy * 0.99 + 0.1, // gravity
            opacity: p.opacity - 0.005
          };
        }).filter(p => p.opacity > 0);
      });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [particles]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: p.opacity,
            borderRadius: '50%',
          }}
        />
      ))}
    </div>
  );
};
