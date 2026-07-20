import { useState, useEffect, useCallback, useRef } from "react";
import Peer, { type MediaConnection } from "peerjs";
import { useAuth } from "@/hooks/useAuth";
import { useIceServers } from "@/hooks/useChat";
import { chatService } from "@/services/chat.service";
import { toast } from "sonner";

export type CallStatus = "IDLE" | "CALLING" | "RINGING" | "ONGOING";

// Module-level cache so React StrictMode's dev-only mount -> cleanup -> mount
// cycle reuses the same PeerJS connection instead of destroying and
// immediately recreating it with the same id, which races with the
// signalling server and throws "ID ... is taken".
let cachedPeer: { id: string; peer: Peer } | null = null;
let pendingDestroy: ReturnType<typeof setTimeout> | null = null;

export function usePeerCall(chatId: number) {
  const { user } = useAuth();
  const peerRef = useRef<Peer | null>(null);
  const [status, setStatus] = useState<CallStatus>("IDLE");
  const [incomingCall, setIncomingCall] = useState<MediaConnection | null>(null);
  const [activeCall, setActiveCall] = useState<MediaConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  // The backend's call record for the call in flight — `null` once it has
  // been answered/declined/ended so a cascade of PeerJS `close` events can't
  // post the same transition twice.
  const activeCallIdRef = useRef<string | null>(null);

  const { data: iceData, isPending: iceLoading } = useIceServers();

  // Initialize peer
  useEffect(() => {
    if (!user) return;
    // Wait for the ICE config so the very first call already carries the
    // backend's TURN servers instead of just PeerJS's default STUN.
    if (iceLoading) return;

    const iceServers = iceData?.iceServers as RTCIceServer[] | undefined;
    const peerOptions = iceServers?.length ? { config: { iceServers } } : undefined;

    // Prefix the peer id to avoid collisions
    const peerId = `ig-clone-user-${user.id}`;

    // Cancel a destroy left pending by the previous (StrictMode) cleanup and
    // reuse that peer instead of creating a duplicate with the same id.
    if (pendingDestroy) {
      clearTimeout(pendingDestroy);
      pendingDestroy = null;
    }

    // The canonical id is one-per-user, but a second open tab (or a stale
    // registration from a crashed session PeerJS hasn't expired yet) claims it
    // first — that used to leave this tab permanently unable to call or be
    // called, with just an error toast to show for it. `retriedId` guards a
    // single fallback attempt so this session still gets a working peer.
    let retriedId = false;
    let currentPeer: Peer;

    const wireUpPeer = (peer: Peer) => {
      peer.on("open", () => {});

      peer.on("call", (call) => {
        setIncomingCall(call);
        setStatus("RINGING");
        setIsVideo(call.metadata?.isVideo ?? true);
        activeCallIdRef.current = call.metadata?.callId ?? null;
      });

      peer.on("error", (err) => {
        if (err.type === "unavailable-id" && !retriedId) {
          retriedId = true;
          peer.destroy();
          const fallbackId = `${peerId}-${Math.random().toString(36).slice(2, 8)}`;
          const fallbackPeer = new Peer(fallbackId, peerOptions);
          cachedPeer = { id: fallbackId, peer: fallbackPeer };
          currentPeer = fallbackPeer;
          peerRef.current = fallbackPeer;
          wireUpPeer(fallbackPeer);
          return;
        }
        if (err.type !== "peer-unavailable") {
          console.error("PeerJS error:", err);
          toast.error("Call service: " + err.message);
        } else {
          toast.error("The user is offline or unavailable.");
          setStatus("IDLE");
          // Made the call, nobody picked up — the backend derives MISSED from
          // an ended call that was never answered.
          const callId = activeCallIdRef.current;
          if (callId) {
            activeCallIdRef.current = null;
            chatService
              .endCall(callId)
              .catch((e) => console.error("Failed to close call record", e));
          }
          if (localStream) {
            localStream.getTracks().forEach((t) => t.stop());
            setLocalStream(null);
          }
        }
      });

      peer.on("disconnected", () => {
        // `destroy()` itself disconnects first, so the cleanup path (unmount,
        // the id-collision fallback) also fires this event — reconnecting a
        // destroyed peer throws "This peer cannot reconnect... already been
        // destroyed" instead of doing anything.
        if (peer.destroyed) return;
        console.warn("PeerJS disconnected. Attempting to reconnect...");
        peer.reconnect();
      });
    };

    if (cachedPeer && cachedPeer.id === peerId && !cachedPeer.peer.destroyed) {
      currentPeer = cachedPeer.peer;
      currentPeer.removeAllListeners("open");
      currentPeer.removeAllListeners("call");
      currentPeer.removeAllListeners("error");
      currentPeer.removeAllListeners("disconnected");
    } else {
      cachedPeer?.peer.destroy();
      currentPeer = new Peer(peerId, peerOptions);
      cachedPeer = { id: peerId, peer: currentPeer };
    }

    wireUpPeer(currentPeer);
    peerRef.current = currentPeer;

    return () => {
      peerRef.current = null;
      // Defer the actual destroy: if this cleanup is StrictMode's dev-only
      // throwaway pass, the effect above cancels it and reuses this peer.
      pendingDestroy = setTimeout(() => {
        currentPeer.destroy();
        if (cachedPeer?.peer === currentPeer) cachedPeer = null;
      }, 0);
    };
    // We disable exhaustivedeps because we only want to (re)connect once on mount
    // when the user and ICE config are ready — `iceLoading` here just re-triggers
    // the effect the one time it flips to false, it isn't a live config swap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, iceLoading]);

  const stopStreams = useCallback((stream: MediaStream | null) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }, []);

  const endCall = useCallback(() => {
    // Guarded so a `close` event cascading in after an explicit hang-up (or
    // after `declineCall` already resolved it) doesn't post the transition twice.
    const callId = activeCallIdRef.current;
    if (callId) {
      activeCallIdRef.current = null;
      chatService.endCall(callId).catch((e) => console.error("Failed to close call record", e));
    }
    if (activeCall) {
      activeCall.close();
      setActiveCall(null);
    }
    if (incomingCall) {
      incomingCall.close();
      setIncomingCall(null);
    }
    setLocalStream((prev) => {
      stopStreams(prev);
      return null;
    });
    setRemoteStream(null);
    setStatus("IDLE");
  }, [activeCall, incomingCall, stopStreams]);

  const startLocalStream = async (video: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video,
        audio: true,
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Failed to get local stream", error);
      toast.error("Could not access microphone or camera");
      endCall();
      throw error;
    }
  };

  const makeCall = async (peerUserId: string, video: boolean) => {
    const peer = peerRef.current;
    if (!peer) {
      toast.error("Call service is not connected yet. Please wait.");
      return;
    }
    try {
      setIsVideo(video);
      setStatus("CALLING");
      const stream = await startLocalStream(video);

      // Best-effort: the call record is for history/TURN bookkeeping, not a
      // gate — a failed POST here must not stop the actual call from going out.
      let callId: string | null = null;
      try {
        const started = await chatService.startCall(chatId, video ? "VIDEO" : "AUDIO");
        callId = started.callId;
      } catch (e) {
        console.error("Failed to open call record", e);
      }
      activeCallIdRef.current = callId;

      const targetPeerId = `ig-clone-user-${peerUserId}`;
      const call = peer.call(targetPeerId, stream, { metadata: { isVideo: video, callId } });

      setActiveCall(call);

      call.on("stream", (userVideoStream) => {
        setRemoteStream(userVideoStream);
        setStatus("ONGOING");
      });

      call.on("close", () => {
        endCall();
      });

      call.on("error", () => {
        endCall();
      });
    } catch {
      setStatus("IDLE");
    }
  };

  const answerCall = async () => {
    if (!incomingCall) return;
    try {
      const stream = await startLocalStream(incomingCall.metadata?.isVideo ?? true);
      incomingCall.answer(stream);
      setActiveCall(incomingCall);
      setStatus("ONGOING");

      const callId = activeCallIdRef.current;
      if (callId) {
        chatService
          .answerCall(callId)
          .catch((e) => console.error("Failed to mark call answered", e));
      }

      incomingCall.on("stream", (userVideoStream) => {
        setRemoteStream(userVideoStream);
      });

      incomingCall.on("close", () => {
        endCall();
      });

      setIncomingCall(null);
    } catch {
      endCall();
    }
  };

  const declineCall = () => {
    const callId = activeCallIdRef.current;
    if (callId) {
      activeCallIdRef.current = null;
      chatService
        .declineCall(callId)
        .catch((e) => console.error("Failed to mark call declined", e));
    }
    if (incomingCall) {
      incomingCall.close();
      setIncomingCall(null);
    }
    setStatus("IDLE");
  };

  return {
    status,
    localStream,
    remoteStream,
    isVideo,
    makeCall,
    answerCall,
    declineCall,
    endCall,
    incomingCallPeerId: incomingCall?.peer?.replace("ig-clone-user-", ""),
  };
}
