"use client";

import { AnimatePresence, motion } from "framer-motion";

export type FloatingHeart = { id: number; emoji: string; offset: number };

/**
 * The hearts and emoji that drift up the right edge when anyone taps.
 *
 * Only ones **this** viewer sends are shown: reading other people's taps needs
 * the socket, which has no usable auth. So this is honest decoration of your own
 * input, not a fake crowd — the real like *count* next to it is server truth.
 */
export function LiveHearts({ hearts }: { hearts: FloatingHeart[] }) {
  return (
    <div className="pointer-events-none absolute right-2 bottom-16 h-64 w-16 overflow-hidden">
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.span
            key={heart.id}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], y: -220, scale: 1, x: heart.offset }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, ease: "easeOut" }}
            className="absolute bottom-0 left-4 text-2xl"
          >
            {heart.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
