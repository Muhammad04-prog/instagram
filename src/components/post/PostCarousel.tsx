"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn, getImageUrl } from "@/lib/utils";
import { isVideo } from "@/types/post.types";

/**
 * The media area of a post: a single file, or an embla carousel with IG's dots
 * and side arrows (docs/screenshots/img11 — dots under the media).
 * `images` may contain videos (".mp4"), so each slide picks its own tag.
 */
export function PostCarousel({
  images,
  alt,
  onDoubleTap,
  className,
}: {
  images: string[];
  alt: string;
  onDoubleTap?: () => void;
  className?: string;
}) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: false });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla]);

  const scrollTo = useCallback((index: number) => embla?.scrollTo(index), [embla]);

  return (
    <div className={cn("relative", className)}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {images.map((file, index) => (
            <div key={file} className="relative min-w-0 flex-[0_0_100%]">
              <Media file={file} alt={alt} onDoubleTap={onDoubleTap} priority={index === 0} />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 ? (
        <div className="absolute right-0 bottom-3 left-0 flex justify-center gap-1">
          {images.map((file, index) => (
            <button
              key={file}
              type="button"
              aria-label={`${index + 1}`}
              onClick={() => scrollTo(index)}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                index === selected ? "bg-ig-primary" : "bg-white/40",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Media({
  file,
  alt,
  onDoubleTap,
  priority,
}: {
  file: string;
  alt: string;
  onDoubleTap?: () => void;
  priority: boolean;
}) {
  const url = getImageUrl(file) ?? "";

  if (isVideo(file)) {
    return (
      <video
        src={url}
        controls
        playsInline
        onDoubleClick={onDoubleTap}
        className="bg-ig-bg-secondary max-h-[70vh] w-full object-contain"
      />
    );
  }

  return (
    <div
      onDoubleClick={onDoubleTap}
      className="bg-ig-bg-secondary relative flex aspect-square w-full items-center justify-center"
    >
      <Image src={url} alt={alt} fill priority={priority} sizes="470px" className="object-cover" />
    </div>
  );
}
