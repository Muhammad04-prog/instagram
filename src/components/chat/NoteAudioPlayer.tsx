"use client";

import { useEffect, useRef } from "react";

export function NoteAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // Play audio when component mounts (when note dialog is opened)
      audio.play().catch(() => {});
    }

    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [src]);

  return <audio ref={audioRef} src={src} loop hidden />;
}
