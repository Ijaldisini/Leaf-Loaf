import { useEffect, useRef } from "react";

export default function CursorEffect() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const particles = particlesRef.current;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        p.size += 0.03;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        ctx.strokeStyle = `rgba(255,255,255,${p.life * 0.7})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
          p.x - p.size * 0.25,
          p.y - p.size * 0.25,
          p.size * 0.15,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = `rgba(255,255,255,${p.life * 0.35})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    function onClick(e) {
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI - Math.PI;
        const speed = Math.random() * 1.5 + 0.5;

        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed * 0.4,
          vy: -Math.abs(Math.sin(angle) * speed) - 0.4,
          size: Math.random() * 5 + 3,
          life: 1,
          decay: 0.015 + Math.random() * 0.01,
        });
      }
    }

    window.addEventListener("click", onClick);
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
