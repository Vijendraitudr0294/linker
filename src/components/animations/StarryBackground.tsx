import { useEffect, useRef, memo } from "react";

/**
 * StarryBackground — A lightweight, Nordic-inspired background with
 * small star-like dots and occasional shooting stars.
 * 
 * ISOLATED: This component is self-contained. It only renders a <canvas>
 * and manages its own animation loop. No external state, no side effects
 * on siblings. Safe to mount/unmount anywhere.
 */

interface StarryBackgroundProps {
  /** Number of static star dots (default 120) */
  starCount?: number;
  /** Base star color (default "rgba(255,255,255,0.6)") */
  starColor?: string;
  /** Shooting star frequency — avg ms between shooting stars (default 4000) */
  shootingStarInterval?: number;
  /** Canvas z-index so it sits behind content (default 0) */
  zIndex?: number;
  /** Background fill (default "transparent") */
  bgFill?: string;
  className?: string;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  maxLife: number;
}

const StarryBackground = memo(({
  starCount = 120,
  starColor = "rgba(255,255,255,0.6)",
  shootingStarInterval = 4000,
  zIndex = 0,
  bgFill = "transparent",
  className = "",
}: StarryBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const lastShootRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize handler
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    // Initialize static stars
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    starsRef.current = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: Math.random() * 1.2 + 0.3,
      opacity: Math.random() * 0.5 + 0.3,
      twinkleSpeed: Math.random() * 0.002 + 0.001,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    const createShootingStar = (): ShootingStar => {
      const startX = Math.random() * w * 0.8;
      const startY = Math.random() * h * 0.4;
      return {
        x: startX,
        y: startY,
        length: Math.random() * 60 + 40,
        speed: Math.random() * 4 + 3,
        angle: (Math.PI / 6) + Math.random() * (Math.PI / 8),
        opacity: 1,
        life: 0,
        maxLife: Math.random() * 40 + 30,
      };
    };

    const startTime = performance.now();

    const draw = (now: number) => {
      const elapsed = now - startTime;
      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;

      ctx.clearRect(0, 0, cw, ch);

      if (bgFill !== "transparent") {
        ctx.fillStyle = bgFill;
        ctx.fillRect(0, 0, cw, ch);
      }

      // Draw static stars with twinkle
      for (const star of starsRef.current) {
        const twinkle = Math.sin(elapsed * star.twinkleSpeed + star.twinklePhase);
        const alpha = star.opacity + twinkle * 0.25;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = starColor.replace(/[\d.]+\)$/, `${Math.max(0.05, Math.min(1, alpha))})`);
        ctx.fill();
      }

      // Spawn shooting stars
      if (now - lastShootRef.current > shootingStarInterval + Math.random() * 2000) {
        shootingStarsRef.current.push(createShootingStar());
        lastShootRef.current = now;
      }

      // Draw shooting stars
      shootingStarsRef.current = shootingStarsRef.current.filter((ss) => {
        ss.life++;
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.opacity = 1 - ss.life / ss.maxLife;

        if (ss.opacity <= 0) return false;

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        const gradient = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        gradient.addColorStop(0, `rgba(255,255,255,0)`);
        gradient.addColorStop(1, `rgba(255,255,255,${ss.opacity * 0.8})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.2;
        ctx.lineCap = "round";
        ctx.stroke();

        // Bright head
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${ss.opacity})`;
        ctx.fill();

        return true;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(([entry]) => {
      const isVisible = entry.isIntersecting;
      if (isVisible) {
        if (!animRef.current) {
          animRef.current = requestAnimationFrame(draw);
        }
      } else {
        if (animRef.current) {
          cancelAnimationFrame(animRef.current);
          animRef.current = 0;
        }
      }
    }, { threshold: 0.01 });

    observer.observe(canvas);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      const nw = canvas.offsetWidth;
      const nh = canvas.offsetHeight;
      starsRef.current = starsRef.current.map((s) => ({
        ...s,
        x: Math.random() * nw,
        y: Math.random() * nh,
      }));
    });
    resizeObserver.observe(canvas);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      resizeObserver.disconnect();
      observer.disconnect();
    };
  }, [starCount, starColor, shootingStarInterval, bgFill]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex }}
      aria-hidden="true"
    />
  );
});

StarryBackground.displayName = "StarryBackground";

export default StarryBackground;
