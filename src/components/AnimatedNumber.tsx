import { useEffect, useRef, useState } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

interface Props {
  value: number;
  formatter: (v: number) => string;
  style?: StyleProp<TextStyle>;
  prefix?: string;
  duration?: number;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// Counts from the previous value to the new one on every change — including
// 0 -> value on first mount, which reads as the hero number "revealing".
export function AnimatedNumber({ value, formatter, style, prefix = '', duration = 700 }: Props) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      setDisplay(from + (to - from) * easeOutCubic(t));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return (
    <Text style={style}>
      {prefix}
      {formatter(display)}
    </Text>
  );
}
