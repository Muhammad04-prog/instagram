import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AccessibilityState {
  reduceMotion: boolean;
  setReduceMotion: (reduceMotion: boolean) => void;
}

/** Settings → "Специальные возможности" (img). Actually disables framer-motion
 * animations app-wide via <MotionConfig> in Providers, not just a decorative switch. */
export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      reduceMotion: false,
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
    }),
    { name: "ig-accessibility" },
  ),
);
