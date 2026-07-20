"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Volume2, VolumeX, ImageOff } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
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
    return <VideoSlide slide={slide} url={url} onDoubleTap={onDoubleTap} />;
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

/**
 * A feed/modal video: IG's own minimal control, not the browser's — tap
 * toggles play, autoplay (muted) kicks in once it's mostly on screen, and a
 * corner button is the only way to unmute. Mirrors ReelCard's pattern, but
 * `muted` is local here since each slide is its own small player, not a
 * shared full-bleed reel feed.
 */
function VideoSlide({
  slide,
  url,
  onDoubleTap,
}: {
  slide: PostMediaDto;
  url: string;
  onDoubleTap?: () => void;
}) {
  const t = useTranslations("post");
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  // See docs/BACKEND_REQUEST.md #4 — some `media[].url` 404 through Cloudinary's
  // broken fetch delivery; fall back to a placeholder instead of a stuck player.
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void video
            .play()
            .then(() => setPlaying(true))
            .catch(() => setPlaying(false));
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  if (failed) {
    return (
      <div className="bg-ig-bg-secondary text-ig-text-secondary flex aspect-square w-full flex-col items-center justify-center gap-2">
        <ImageOff className="size-8" />
        <p className="text-sm">{t("videoUnavailable")}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        ref={ref}
        src={`${url}#t=0.1`}
        poster={slide.thumbUrl ?? undefined}
        loop
        muted={muted}
        playsInline
        onClick={togglePlay}
        onDoubleClick={onDoubleTap}
        onError={() => setFailed(true)}
        style={{ filter: filterCss(slide.filter) }}
        className="bg-ig-bg-secondary max-h-[70vh] w-full object-contain"
      />

      {!playing ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="size-16 rounded-full bg-black/40" />
        </span>
      ) : null}

      <button
        type="button"
        aria-label={muted ? t("unmute") : t("mute")}
        onClick={() => setMuted((value) => !value)}
        className="absolute right-3 bottom-3 rounded-full bg-black/50 p-2 text-white"
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
    </div>
  );
}
