import { InstagramGlyph } from "@/components/icons/InstagramGlyph";
import { MetaLogo } from "@/components/icons/MetaLogo";

/**
 * The app's loading identity — Instagram's own splash: the gradient glyph
 * centred on the app background, "from Meta" pinned near the bottom. Shown as
 * the route-level Suspense fallback (initial load and hard refreshes). Pure
 * server markup + a CSS pulse, so it paints before any client JS runs.
 */
export default function Loading() {
  return (
    <div className="bg-ig-bg fixed inset-0 z-50 flex flex-col items-center justify-center">
      <InstagramGlyph size={68} className="animate-pulse" />
      <div className="absolute bottom-10 flex flex-col items-center gap-1.5">
        <span className="text-ig-text-secondary text-xs">from</span>
        <MetaLogo />
      </div>
    </div>
  );
}
