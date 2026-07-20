"use client";

import { Heart, ImageIcon, Loader2, Mic, SmilePlus, Square, X } from "lucide-react";
import { EmojiPicker } from "@/components/chat/EmojiPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Mp3Encoder } from "@breezystack/lamejs";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSendMessage } from "@/hooks/useChat";
import { useChatStore } from "@/store/chat.store";
import { cn } from "@/lib/utils";

/**
 * MediaRecorder only ever produces webm/mp4 containers, and the backend
 * accepts neither for audio (only `mp3`/`m4a`, see docs/BACKEND_REQUEST.md) —
 * so the recorded clip is decoded back to PCM and re-encoded to mp3 with
 * `lamejs` before it's handed to `chatService.send`. Voice notes are mono;
 * downmixing to channel 0 only matches what a real voice message needs.
 */
async function encodeRecordingToMp3(recording: Blob): Promise<File> {
  const AudioCtx = window.AudioContext;
  const ctx = new AudioCtx();
  try {
    const audioBuffer = await ctx.decodeAudioData(await recording.arrayBuffer());
    const floatSamples = audioBuffer.getChannelData(0);
    const pcm = new Int16Array(floatSamples.length);
    for (let i = 0; i < floatSamples.length; i++) {
      const clamped = Math.max(-1, Math.min(1, floatSamples[i] ?? 0));
      pcm[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    }

    const encoder = new Mp3Encoder(1, audioBuffer.sampleRate, 128);
    const chunks: Uint8Array[] = [];
    const blockSize = 1152;
    for (let i = 0; i < pcm.length; i += blockSize) {
      const chunk = encoder.encodeBuffer(pcm.subarray(i, i + blockSize));
      if (chunk.length > 0) chunks.push(chunk);
    }
    const tail = encoder.flush();
    if (tail.length > 0) chunks.push(tail);

    return new File(
      chunks.map((chunk) => new Uint8Array(chunk)),
      "voice-message.mp3",
      { type: "audio/mpeg" },
    );
  } finally {
    void ctx.close();
  }
}

/** Rounded composer bar (img21): emoji left, attach on the right, Enter or "Send" to submit. */
export function MessageInput({ chatId }: { chatId: number }) {
  const t = useTranslations("chat");
  const draft = useChatStore((s) => s.drafts[chatId] ?? "");
  const setDraft = useChatStore((s) => s.setDraft);
  const send = useSendMessage(chatId);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [recording, setRecording] = useState(false);
  const [encoding, setEncoding] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const text = draft.trim();
  // The server happily stores a message with neither text nor file
  // (BACKEND_BUGS #17), so the empty case is blocked here.
  const canSend = (text.length > 0 || file !== null) && !send.isPending;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    send.mutate({ text: text || undefined, file: file ?? undefined });
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // Recorded clip becomes a plain `file` — it rides the same preview/remove/send
  // path a picked image already uses, `optimisticType` picks AUDIO off its mime.
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (blob.size === 0) return;

        setEncoding(true);
        encodeRecordingToMp3(blob)
          .then(setFile)
          .catch((e: unknown) => {
            console.error("Failed to encode voice message", e);
            toast.error(t("voiceEncodeFailed"));
          })
          .finally(() => setEncoding(false));
      };

      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      toast.error(t("micDenied"));
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  };

  // Leaving the chat mid-recording must not leave the mic hot.
  useEffect(() => {
    return () => {
      recorderRef.current?.stop();
    };
  }, []);

  return (
    <form onSubmit={submit} className="px-4 pt-2 pb-4">
      {file ? (
        <div className="text-ig-text-secondary mb-2 flex items-center gap-2 text-xs">
          <span className="truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (fileRef.current) fileRef.current.value = "";
            }}
            aria-label={t("removeAttachment")}
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      <div className="border-ig-border flex items-center gap-3 rounded-full border px-4 py-2">
        {/* Was a dead button with no handler at all — the panel it is supposed
            to open (docs/screenshots/img22) had never been built. */}
        <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={t("emoji")}
              className="text-ig-text-secondary shrink-0 transition-colors hover:opacity-70"
            >
              <SmilePlus className="size-6" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            sideOffset={12}
            className="w-auto border-none bg-transparent p-0 shadow-none"
          >
            <EmojiPicker onPick={(emoji) => setDraft(chatId, draft + emoji)} />
          </PopoverContent>
        </Popover>

        <input
          value={draft}
          onChange={(event) => setDraft(chatId, event.target.value)}
          placeholder={t("typeMessage")}
          aria-label={t("typeMessage")}
          className="text-ig-text placeholder:text-ig-text-secondary flex-1 bg-transparent text-sm outline-none"
        />

        {canSend ? (
          <button type="submit" className="text-ig-primary shrink-0 text-sm font-semibold">
            {t("send")}
          </button>
        ) : (
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              aria-label={recording ? t("stopRecording") : t("voiceMessage")}
              onClick={() => (recording ? stopRecording() : void startRecording())}
              disabled={encoding}
              className={cn(
                "transition-colors hover:opacity-70 disabled:opacity-50",
                recording ? "text-ig-danger" : "text-ig-text",
              )}
            >
              {encoding ? (
                <Loader2 className="size-5 animate-spin" />
              ) : recording ? (
                <Square className="size-4 fill-current" />
              ) : (
                <Mic className="size-6" />
              )}
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="hidden"
              id={`chat-file-${chatId}`}
            />
            <label
              htmlFor={`chat-file-${chatId}`}
              aria-label={t("attach")}
              className="text-ig-text cursor-pointer transition-colors hover:opacity-70"
            >
              <ImageIcon className="size-6" />
            </label>

            <button
              type="button"
              aria-label={t("like")}
              className="text-ig-text transition-colors hover:opacity-70"
            >
              <Heart className="size-6" />
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
