// useFadeUp — returns a ref and a boolean `visible`
// When the element enters the viewport, visible becomes true
// Use with the .fade-up / .fade-up.visible CSS classes

import { useEffect, useRef, useState } from "react";

export function useFadeUp(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}
