"use client";

import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { StickerResultsDialog } from "@/components/story/StickerResultsDialog";
import { useAnswerSticker, useStoryStickers } from "@/hooks/useStories";
import { cn } from "@/lib/utils";
import type { StickerDto } from "@/types/api.types";

interface PollConfig {
  question?: string;
  options?: string[];
  correctIndex?: number;
}
interface QuestionConfig {
  prompt?: string;
}
interface SliderConfig {
  question?: string;
  emoji?: string;
}
interface CountdownConfig {
  title?: string;
  endsAt?: string;
}
interface LinkConfig {
  url?: string;
  label?: string;
}

function geometryStyle(sticker: StickerDto): { left: string; top: string } {
  const geometry = sticker.geometry as { x?: number; y?: number } | null | undefined;
  return { left: `${(geometry?.x ?? 0.5) * 100}%`, top: `${(geometry?.y ?? 0.45) * 100}%` };
}

/**
 * Interactive stickers overlaid on the current slide — `GET /stories/{id}/stickers`
 * is its own call (not part of `StoryDto`), so this only fetches once a slide is
 * actually shown. New in the 19.07.2026 swagger refresh; no reference screenshot
 * exists (same "no reference" situation `StoryViewer` itself documents).
 */
export function StoryStickerLayer({
  storyId,
  isMine,
  onBusyChange,
}: {
  storyId: number;
  isMine: boolean;
  onBusyChange: (busy: boolean) => void;
}) {
  const { data } = useStoryStickers(storyId);

  if (!data || data.length === 0) return null;

  return (
    <>
      {data.map((sticker) => (
        <StickerOverlay
          key={sticker.id}
          storyId={storyId}
          sticker={sticker}
          isMine={isMine}
          onBusyChange={onBusyChange}
        />
      ))}
    </>
  );
}

function StickerOverlay({
  storyId,
  sticker,
  isMine,
  onBusyChange,
}: {
  storyId: number;
  sticker: StickerDto;
  isMine: boolean;
  onBusyChange: (busy: boolean) => void;
}) {
  const t = useTranslations("story");
  const answer = useAnswerSticker(storyId);
  const [resultsOpen, setResultsOpen] = useState(false);
  const answered =
    sticker.myAnswer?.optionIndex != null ||
    sticker.myAnswer?.text != null ||
    sticker.myAnswer?.sliderValue != null;

  const style = geometryStyle(sticker);

  const resultsButton = isMine ? (
    <button
      type="button"
      onClick={() => setResultsOpen(true)}
      className="mt-1.5 block text-[11px] font-semibold text-white/80 underline"
    >
      {t("stickerViewResults")}
    </button>
  ) : null;

  let content: ReactNode = null;

  if (sticker.type === "POLL" || sticker.type === "QUIZ") {
    const config = sticker.config as PollConfig;
    const options = config.options ?? [];

    content = (
      <div
        className="pointer-events-auto absolute z-[7] w-64 max-w-[80%] -translate-x-1/2 rounded-2xl bg-black/55 p-3 text-center backdrop-blur-sm"
        style={style}
      >
        {config.question ? (
          <p className="mb-2 text-sm font-semibold text-white">{config.question}</p>
        ) : null}
        <div className="space-y-1.5">
          {options.map((option, index) => {
            const mine = sticker.myAnswer?.optionIndex === index;
            const revealedCorrect =
              sticker.type === "QUIZ" && answered && answer.data?.correctIndex === index;

            return (
              <button
                key={index}
                type="button"
                disabled={isMine || answer.isPending}
                onClick={() =>
                  answer.mutate(
                    { stickerId: sticker.id, dto: { optionIndex: index } },
                    { onSuccess: () => toast.success(t("stickerAnswerSent")) },
                  )
                }
                className={cn(
                  "w-full rounded-full border border-white/40 py-1.5 text-xs font-semibold text-white",
                  mine && "bg-white text-black",
                  revealedCorrect && !mine && "border-ig-success text-ig-success",
                  isMine && "opacity-70",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
        {resultsButton}
      </div>
    );
  } else if (sticker.type === "QUESTION") {
    const config = sticker.config as QuestionConfig;
    content = (
      <div
        className="pointer-events-auto absolute z-[7] w-64 max-w-[80%] -translate-x-1/2 rounded-2xl bg-black/55 p-3 backdrop-blur-sm"
        style={style}
      >
        <p className="mb-2 text-center text-sm font-semibold text-white">
          {config.prompt ?? t("stickerPromptPlaceholder")}
        </p>
        {isMine || answered ? (
          answered ? (
            <p className="text-center text-xs text-white/80">{t("stickerAnswerSent")}</p>
          ) : null
        ) : (
          <QuestionForm
            onSubmit={(text) =>
              answer.mutate(
                { stickerId: sticker.id, dto: { text } },
                { onSuccess: () => toast.success(t("stickerAnswerSent")) },
              )
            }
            onBusyChange={onBusyChange}
          />
        )}
        {resultsButton}
      </div>
    );
  } else if (sticker.type === "SLIDER") {
    const config = sticker.config as SliderConfig;
    content = (
      <div
        className="pointer-events-auto absolute z-[7] w-64 max-w-[80%] -translate-x-1/2 rounded-2xl bg-black/55 p-3 text-center backdrop-blur-sm"
        style={style}
      >
        {config.question ? (
          <p className="mb-2 text-sm font-semibold text-white">{config.question}</p>
        ) : null}
        {isMine ? (
          <p className="text-2xl">{config.emoji ?? "❤️"}</p>
        ) : (
          <SliderForm
            emoji={config.emoji ?? "❤️"}
            defaultValue={sticker.myAnswer?.sliderValue ?? 0.5}
            onSubmit={(value) =>
              answer.mutate(
                { stickerId: sticker.id, dto: { sliderValue: value } },
                { onSuccess: () => toast.success(t("stickerAnswerSent")) },
              )
            }
            onBusyChange={onBusyChange}
          />
        )}
        {resultsButton}
      </div>
    );
  } else if (sticker.type === "COUNTDOWN") {
    const config = sticker.config as CountdownConfig;
    content = (
      <div
        className="pointer-events-none absolute z-[7] w-56 max-w-[80%] -translate-x-1/2 rounded-2xl bg-black/55 p-3 text-center backdrop-blur-sm"
        style={style}
      >
        <p className="text-sm font-semibold text-white">{config.title}</p>
        {config.endsAt ? (
          <time dateTime={config.endsAt} className="text-xs text-white/80">
            {new Date(config.endsAt).toLocaleString()}
          </time>
        ) : null}
      </div>
    );
  } else if (sticker.type === "LINK") {
    const config = sticker.config as LinkConfig;
    content = config.url ? (
      <a
        href={config.url}
        target="_blank"
        rel="noreferrer"
        className="pointer-events-auto absolute z-[7] -translate-x-1/2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black"
        style={style}
      >
        {config.label || config.url}
      </a>
    ) : null;
  }

  return (
    <>
      {content}
      {isMine ? (
        <StickerResultsDialog
          storyId={storyId}
          stickerId={sticker.id}
          type={sticker.type}
          open={resultsOpen}
          onOpenChange={setResultsOpen}
        />
      ) : null}
    </>
  );
}

function QuestionForm({
  onSubmit,
  onBusyChange,
}: {
  onSubmit: (text: string) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const t = useTranslations("story");
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const text = value.trim();
        if (!text) return;
        onSubmit(text);
        setValue("");
      }}
      className="flex items-center gap-2"
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => onBusyChange(true)}
        onBlur={() => onBusyChange(false)}
        placeholder={t("stickerPromptPlaceholder")}
        className="h-8 flex-1 rounded-full bg-white/20 px-3 text-xs text-white outline-none placeholder:text-white/60"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
      >
        {t("stickerSubmit")}
      </button>
    </form>
  );
}

function SliderForm({
  emoji,
  defaultValue,
  onSubmit,
  onBusyChange,
}: {
  emoji: string;
  defaultValue: number;
  onSubmit: (value: number) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const t = useTranslations("story");
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{emoji}</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onPointerDown={() => onBusyChange(true)}
        onPointerUp={() => onBusyChange(false)}
        onChange={(event) => setValue(Number(event.target.value))}
        className="flex-1"
      />
      <button
        type="button"
        onClick={() => onSubmit(value)}
        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black"
      >
        {t("stickerSliderSend")}
      </button>
    </div>
  );
}
