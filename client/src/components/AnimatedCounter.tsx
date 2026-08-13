// AnimatedCounter — counts up from 0 to target when element enters viewport
import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number; // ms
}

export function AnimatedCounter({ target, suffix = "", prefix = "", decimals = 0, duration = 1400 }: AnimatedCounterProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(parseFloat((eased * target).toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();

  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  );
}

// StatStrip — three key stats from the paper
export function StatStrip() {
  return (
    <div className="stat-strip">
      <div className="stat-item">
        <div className="stat-value">
          <AnimatedCounter target={280} suffix="×" />
        </div>
        <div className="stat-label">
          Cost decline in inference per token, 2022–2024
        </div>
      </div>
      <div className="stat-item">
        <div className="stat-value">
          $<AnimatedCounter target={725} suffix="B" />
        </div>
        <div className="stat-label">
          Hyperscaler capex guidance for 2026
        </div>
      </div>
      <div className="stat-item">
        <div className="stat-value">
          <AnimatedCounter target={5} suffix="th" />
        </div>
        <div className="stat-label">
          Infrastructure turning point in history — the AI cycle
        </div>
      </div>
    </div>
  );
}
