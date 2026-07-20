"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateStickerDto } from "@/types/api.types";

type StickerKind = "POLL" | "QUESTION" | "SLIDER";

/**
 * Builds one `CreateStickerDto` at a time — POLL / QUESTION / SLIDER only.
 * QUIZ (needs a "correct answer" author flow), COUNTDOWN and LINK
 * (verified-only) are answerable and viewable (`StoryStickerLayer`) but not
 * exposed in the composer yet — a scoped omission, not an oversight; there is
 * no screenshot for this editor either way (see `StoryUploadDialog`).
 *
 * Placement is fixed (no draggable canvas) — same simplification the existing
 * text-caption overlay already makes.
 */
export function StickerComposer({
  onChange,
}: {
  onChange: (dto: CreateStickerDto | null) => void;
}) {
  const t = useTranslations("story");
  const [kind, setKind] = useState<StickerKind>("POLL");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [prompt, setPrompt] = useState("");
  const [emoji, setEmoji] = useState("❤️");

  const commit = (
    nextKind: StickerKind,
    nextQuestion: string,
    nextOptions: string[],
    nextPrompt: string,
    nextEmoji: string,
  ) => {
    if (nextKind === "POLL") {
      const filled = nextOptions.map((option) => option.trim()).filter(Boolean);
      if (!nextQuestion.trim() || filled.length < 2) {
        onChange(null);
        return;
      }
      onChange({ type: "POLL", config: { question: nextQuestion.trim(), options: filled } });
    } else if (nextKind === "QUESTION") {
      if (!nextPrompt.trim()) {
        onChange(null);
        return;
      }
      onChange({ type: "QUESTION", config: { prompt: nextPrompt.trim() } });
    } else {
      if (!nextQuestion.trim()) {
        onChange(null);
        return;
      }
      onChange({ type: "SLIDER", config: { question: nextQuestion.trim(), emoji: nextEmoji } });
    }
  };

  return (
    <div className="space-y-3">
      <Select
        value={kind}
        onValueChange={(value) => {
          const next = value as StickerKind;
          setKind(next);
          commit(next, question, options, prompt, emoji);
        }}
      >
        <SelectTrigger className="border-ig-border bg-ig-bg-secondary text-ig-text h-9 w-full rounded-lg px-3 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="POLL">{t("stickerTypePoll")}</SelectItem>
          <SelectItem value="QUESTION">{t("stickerTypeQuestion")}</SelectItem>
          <SelectItem value="SLIDER">{t("stickerTypeSlider")}</SelectItem>
        </SelectContent>
      </Select>

      {kind === "POLL" ? (
        <div className="space-y-2">
          <input
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              commit(kind, event.target.value, options, prompt, emoji);
            }}
            placeholder={t("stickerQuestionPlaceholder")}
            className="bg-ig-bg-secondary text-ig-text placeholder:text-ig-text-secondary h-9 w-full rounded-lg px-3 text-sm outline-none"
          />
          {options.map((option, index) => (
            <input
              key={index}
              value={option}
              onChange={(event) => {
                const next = [...options];
                next[index] = event.target.value;
                setOptions(next);
                commit(kind, question, next, prompt, emoji);
              }}
              placeholder={t("stickerOption", { n: index + 1 })}
              className="bg-ig-bg-secondary text-ig-text placeholder:text-ig-text-secondary h-9 w-full rounded-lg px-3 text-sm outline-none"
            />
          ))}
        </div>
      ) : kind === "QUESTION" ? (
        <input
          value={prompt}
          onChange={(event) => {
            setPrompt(event.target.value);
            commit(kind, question, options, event.target.value, emoji);
          }}
          placeholder={t("stickerPromptPlaceholder")}
          className="bg-ig-bg-secondary text-ig-text placeholder:text-ig-text-secondary h-9 w-full rounded-lg px-3 text-sm outline-none"
        />
      ) : (
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              commit(kind, event.target.value, options, prompt, emoji);
            }}
            placeholder={t("stickerQuestionPlaceholder")}
            className="bg-ig-bg-secondary text-ig-text placeholder:text-ig-text-secondary h-9 flex-1 rounded-lg px-3 text-sm outline-none"
          />
          <input
            value={emoji}
            onChange={(event) => {
              setEmoji(event.target.value);
              commit(kind, question, options, prompt, event.target.value);
            }}
            aria-label={t("stickerSliderEmoji")}
            maxLength={4}
            className="bg-ig-bg-secondary text-ig-text h-9 w-16 rounded-lg px-2 text-center text-sm outline-none"
          />
        </div>
      )}
    </div>
  );
}
