"use client";

import type { LocalTrack, RemoteTrack } from "livekit-client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Attaches a LiveKit video track to a <video> element and detaches it on change/unmount. */
export function LiveKitVideo({
  track,
  muted,
  className,
}: {
  track: LocalTrack | RemoteTrack;
  muted?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    track.attach(element);
    return () => {
      track.detach(element);
    };
  }, [track]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={cn("size-full object-cover", className)}
    />
  );
}
