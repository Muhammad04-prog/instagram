import { useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
  MonitorUp,
  Settings,
  Maximize2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { startRingtone, stopRingtone } from "@/lib/ringtone";

interface CallModalProps {
  status: "IDLE" | "CALLING" | "RINGING" | "ONGOING";
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isVideo: boolean;
  peerName?: string;
  peerUsername?: string;
  peerFullName?: string;
  peerAvatar?: string | null;
  onAnswer: () => void;
  onDecline: () => void;
  onEndCall: () => void;
}

export function CallModal({
  status,
  localStream,
  remoteStream,
  isVideo,
  peerName = "User",
  peerUsername,
  peerFullName,
  peerAvatar = null,
  onAnswer,
  onDecline,
  onEndCall,
}: CallModalProps) {
  const t = useTranslations("chat");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, status]);

  useEffect(() => {
    const remoteMedia = remoteVideoRef.current ?? remoteAudioRef.current;
    if (remoteMedia && remoteStream) {
      remoteMedia.srcObject = remoteStream;
      remoteMedia.play().catch(() => {});
    }
  }, [remoteStream, isVideo, status]);

  // RINGING/CALLING had no audio cue at all — a call could be silently
  // ringing with nothing on screen or ear to say so.
  useEffect(() => {
    if (status === "RINGING") startRingtone("incoming");
    else if (status === "CALLING") startRingtone("outgoing");
    else stopRingtone();
    return () => stopRingtone();
  }, [status]);

  if (status === "IDLE") return null;

  const displayCenterName = peerFullName || peerName;
  const displayTopName = peerUsername || peerName;

  return (
    <Dialog open>
      <DialogContent
        showCloseButton={false}
        className="fixed inset-0 top-0 left-0 z-50 m-0 flex h-screen w-screen max-w-none translate-x-0 translate-y-0 flex-col items-center justify-center gap-0 rounded-none border-none bg-black p-0 shadow-none sm:max-w-none sm:rounded-none"
      >
        <DialogTitle className="sr-only">Call in progress</DialogTitle>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 z-20 flex w-full items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <UserAvatar src={peerAvatar} size={40} className="border border-white/20" />
            <span className="text-lg font-bold text-white">{displayTopName}</span>
          </div>
          <div className="flex items-center gap-4 text-white">
            <Settings className="size-6 cursor-pointer hover:opacity-80" />
            <Maximize2 className="size-6 cursor-pointer hover:opacity-80" />
          </div>
        </div>

        {/* Remote Video or Avatar */}
        {status === "ONGOING" && remoteStream && isVideo ? (
          <video
            ref={remoteVideoRef}
            playsInline
            className="absolute inset-0 z-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-black">
            <UserAvatar src={peerAvatar} size={120} className="mb-6 shadow-2xl" />
            <h2 className="text-3xl font-bold text-white">{displayCenterName}</h2>
            <p className="mt-3 text-sm font-medium text-white/70">
              {status === "RINGING" && t("incomingCall", { fallback: "Incoming call..." })}
              {status === "CALLING" && t("calling", { fallback: "Calling..." })}
              {status === "ONGOING" && !isVideo && t("voiceCall", { fallback: "Voice call" })}
            </p>
            {/* Audio element for voice calls */}
            {status === "ONGOING" && !isVideo && remoteStream && (
              <audio ref={remoteAudioRef} className="hidden" />
            )}
          </div>
        )}

        {/* Local Video PIP */}
        {(status === "ONGOING" || status === "CALLING") && localStream && isVideo && (
          <div className="absolute right-8 bottom-8 z-10 h-48 w-64 overflow-hidden rounded-xl bg-zinc-900 shadow-2xl">
            <video
              ref={localVideoRef}
              playsInline
              muted
              className="h-full w-full -scale-x-100 transform object-cover"
            />
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4">
          {status === "RINGING" ? (
            <>
              <Button
                variant="destructive"
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={onDecline}
              >
                <PhoneOff className="size-6" />
              </Button>
              <Button
                className="h-14 w-14 rounded-full bg-green-500 text-white hover:bg-green-600"
                size="icon"
                onClick={onAnswer}
              >
                {isVideo ? <Video className="size-6" /> : <Mic className="size-6" />}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-14 w-14 rounded-full bg-[#262626] text-white/70 hover:bg-[#363636]"
              >
                <MonitorUp className="size-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-14 w-14 rounded-full bg-[#262626] text-white/70 hover:bg-[#363636]"
              >
                <VideoOff className="size-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-14 w-14 rounded-full bg-[#262626] text-white/70 hover:bg-[#363636]"
              >
                <MicOff className="size-6" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="h-14 w-14 rounded-full bg-[#ff3040] text-white shadow-lg hover:bg-[#ff3040]/90"
                onClick={onEndCall}
              >
                <PhoneOff className="size-6" />
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
