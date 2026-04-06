import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface DepthFieldProps {
  density: number;
  interactive: boolean;
  className?: string;
}

const DepthField = ({ density, interactive, className }: DepthFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointsRef = useRef<{ x: number; y: number; z: number; speed: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;

    const createPoints = () => {
      pointsRef.current = Array.from({ length: density }, () => ({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random() * 1.4 + 0.25,
        speed: Math.random() * 0.0016 + 0.0007,
      }));
    };

    const resize = () => {
      const parent = canvas.parentElement;
      const width = parent?.clientWidth || 300;
      const height = parent?.clientHeight || 300;
      canvas.width = Math.max(1, Math.floor(width * window.devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(height * window.devicePixelRatio));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const draw = (time: number) => {
      if (!running) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const pointerX = pointerRef.current.x;
      const pointerY = pointerRef.current.y;

      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "rgba(8, 18, 36, 0.25)";
      ctx.fillRect(0, 0, width, height);

      pointsRef.current.forEach((point) => {
        point.z -= point.speed;
        if (point.z <= 0.18) point.z = 1.6;

        const tiltX = interactive ? pointerX * 0.28 : 0;
        const tiltY = interactive ? pointerY * 0.28 : 0;
        const wave = Math.sin((time * 0.00035) + point.x * 2.5) * 0.04;

        const projectedX = centerX + (((point.x + tiltX) + wave) / point.z) * width * 0.33;
        const projectedY = centerY + (((point.y + tiltY) + wave) / point.z) * height * 0.33;
        const alpha = Math.max(0.08, (1.8 - point.z) / 2);
        const radius = Math.max(0.5, (1.8 - point.z) * 1.1);

        ctx.beginPath();
        ctx.fillStyle = `rgba(198, 240, 255, ${alpha})`;
        ctx.arc(projectedX, projectedY, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    const onMove = (event: PointerEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / Math.max(rect.width, 1);
      const y = (event.clientY - rect.top) / Math.max(rect.height, 1);
      if (x < 0 || x > 1 || y < 0 || y > 1) {
        pointerRef.current.x = 0;
        pointerRef.current.y = 0;
        return;
      }
      pointerRef.current.x = (x - 0.5) * 2;
      pointerRef.current.y = (y - 0.5) * 2;
    };

    const onLeave = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };

    createPoints();
    resize();
    raf = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [density, interactive]);

  return <canvas ref={canvasRef} className={cn("absolute inset-0 pointer-events-none", className)} />;
};

export default DepthField;
