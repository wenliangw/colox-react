import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import styles from './styles.module.css';

type RevealProps = {
  children: ReactNode;
  /** Stagger step (0-3) — 80ms apart, so rows cascade instead of popping. */
  delay?: 0 | 1 | 2 | 3;
  className?: string;
};

/**
 * Scroll-triggered reveal: content fades and rises once when it enters
 * the viewport, then the observer disconnects. The transition rides the
 * motion tokens, so the reduced-motion gate collapses it to an instant
 * appearance; users without IntersectionObserver see it immediately.
 */
export default function Reveal({ children, delay = 0, className }: RevealProps): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const classes = [styles.reveal, styles[`d${delay}`], visible ? styles.in : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
}
