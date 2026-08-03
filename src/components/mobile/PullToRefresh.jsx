import { useRef, useState } from 'react';
import { motion, useMotionValue, animate, useTransform } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const PULL_THRESHOLD = 70;

// Simple pull-to-refresh using framer-motion + native touch events.
// Only activates on touch devices when page scroll is at top. Wraps the
// scrollable content area of a dashboard; onRefresh should invalidate queries.
export default function PullToRefresh({ children, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, PULL_THRESHOLD], [0, 1]);

  const handleTouchStart = (e) => {
    if (refreshing) return;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop <= 0) {
      startYRef.current = e.touches[0].clientY;
    } else {
      startYRef.current = null;
    }
  };

  const handleTouchMove = (e) => {
    if (startYRef.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) {
      y.set(Math.min(delta * 0.4, PULL_THRESHOLD * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (startYRef.current === null || refreshing) return;
    startYRef.current = null;
    if (y.get() >= PULL_THRESHOLD) {
      setRefreshing(true);
      animate(y, PULL_THRESHOLD, { duration: 0.2 });
      try {
        await onRefresh?.();
      } catch (e) {
        console.error('PullToRefresh error:', e);
      } finally {
        setRefreshing(false);
        animate(y, 0, { duration: 0.3 });
      }
    } else {
      animate(y, 0, { duration: 0.2 });
    }
  };

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <motion.div style={{ y, position: 'relative' }}>
        <motion.div
          style={{ opacity, position: 'absolute', top: -35, left: '50%', marginLeft: -10, pointerEvents: 'none', zIndex: 50 }}
        >
          <Loader2 size={20} className={`text-brand ${refreshing ? 'animate-spin' : ''}`} />
        </motion.div>
        {children}
      </motion.div>
    </div>
  );
}