"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { filterCss } from "@/lib/filters";
import { cn, getImageUrl } from "@/lib/utils";
import { isVideo, type PostMediaDto } from "@/types/post.types";

/**
 * The media area of a post: a single file, or an embla carousel with IG's dots
 * (docs/screenshots/img11 — dots under the media).
 *
 * Each slide knows its own `type`, so no more guessing a video from its file
 * extension, and `width`/`height` let a slide reserve its real aspect ratio
 * instead of being forced square.
 */
export function PostCarousel({
  media,
  alt,
  onDoubleTap,
  className,
}: {
  media: PostMediaDto[];
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
          {media.map((slide, index) => (
            <div key={slide.url} className="relative min-w-0 flex-[0_0_100%]">
              <Media slide={slide} alt={alt} onDoubleTap={onDoubleTap} priority={index === 0} />
            </div>
          ))}
        </div>
      </div>

      {media.length > 1 ? (
        <div className="absolute right-0 bottom-3 left-0 flex justify-center gap-1">
          {media.map((slide, index) => (
            <button
              key={slide.url}
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
  slide,
  alt,
  onDoubleTap,
  priority,
}: {
  slide: PostMediaDto;
  alt: string;
  onDoubleTap?: () => void;
  priority: boolean;
}) {
  const url = getImageUrl(slide.url) ?? "";

  if (isVideo(slide)) {
    return (
      <video
        src={url}
        poster={slide.thumbUrl ?? undefined}
        controls
        playsInline
        onDoubleClick={onDoubleTap}
        style={{ filter: filterCss(slide.filter) }}
        className="bg-ig-bg-secondary max-h-[70vh] w-full object-contain"
      />
    );
  }

  return (
    <div
      onDoubleClick={onDoubleTap}
      className="bg-ig-bg-secondary relative flex aspect-square w-full items-center justify-center"
    >
      {/* The filter is stored by name, not baked — so it has to be re-applied
          on every render, or the post would look nothing like the preview. */}
      <Image
        src={url}
        alt={alt}
        fill
        priority={priority}
        sizes="470px"
        style={{ filter: filterCss(slide.filter) }}
        className="object-cover"
      />
    </div>
  );
}
