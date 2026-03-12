import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface CountUpProps {
  end: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

const formatNumber = (num: number, end: number) => {
  if (end >= 1000000) {
    const val = num / 1000000;
    return num >= end ? `${Math.round(val)}M` : `${val.toFixed(1)}M`;
  }
  if (end >= 1000) {
    const val = num / 1000;
    return num >= end ? `${Math.round(val)}K` : `${val.toFixed(1)}K`;
  }
  return Math.floor(num).toString();
};

const CountUp = ({ end, suffix = "", duration = 2, className }: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      {formatNumber(count, end)}{suffix}
    </motion.span>
  );
};

export default CountUp;
