import type { Transition } from 'motion/react';

export const motionEase = [0.22, 1, 0.36, 1] as const;

export const motionTransition = {
  fast: { duration: 0.15, ease: motionEase },
  base: { duration: 0.22, ease: motionEase },
  slow: { duration: 0.32, ease: motionEase },
} satisfies Record<string, Transition>;

export const motionSpring = {
  snappy: { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 },
  gentle: { type: 'spring', stiffness: 280, damping: 28, mass: 1 },
} satisfies Record<string, Transition>;
