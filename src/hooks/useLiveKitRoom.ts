"use client";

import { Room, RoomEvent, type LocalTrack, type RemoteTrack } from "livekit-client";
import { useEffect, useState } from "react";

interface UseLiveKitRoomOptions {
  wsUrl: string | undefined;
  token: string | undefined;
  /** Host/guest publishes camera+mic; a plain viewer only subscribes. */
  publish: boolean;
}

interface LiveKitRoomState {
  room: Room | null;
  connected: boolean;
  /** Local camera for a publisher, or the first remote participant's camera for a viewer. */
  videoTrack: LocalTrack | RemoteTrack | null;
  error: Error | null;
}

const initialState: LiveKitRoomState = {
  room: null,
  connected: false,
  videoTrack: null,
  error: null,
};

/**
 * Connects one LiveKit room for the lifetime of a broadcast screen.
 *
 * The token is single-purpose (host gets it from `/live/start`, a viewer from
 * `/live/{id}/join`) so this only ever connects once per (wsUrl, token) pair —
 * there is nothing to refresh mid-call.
 */
export function useLiveKitRoom({ wsUrl, token, publish }: UseLiveKitRoomOptions) {
  const [state, setState] = useState<LiveKitRoomState>(initialState);

  useEffect(() => {
    if (!wsUrl || !token) return undefined;

    let cancelled = false;
    const room = new Room();

    const pickVideoTrack = (): LocalTrack | RemoteTrack | null => {
      if (publish) {
        for (const publication of room.localParticipant.videoTrackPublications.values()) {
          if (publication.track) return publication.track;
        }
        return null;
      }
      for (const participant of room.remoteParticipants.values()) {
        for (const publication of participant.videoTrackPublications.values()) {
          if (publication.track) return publication.track;
        }
      }
      return null;
    };

    const refresh = () => {
      if (!cancelled) setState((s) => ({ ...s, videoTrack: pickVideoTrack() }));
    };

    room.on(RoomEvent.TrackSubscribed, refresh);
    room.on(RoomEvent.TrackUnsubscribed, refresh);
    room.on(RoomEvent.LocalTrackPublished, refresh);
    room.on(RoomEvent.LocalTrackUnpublished, refresh);
    room.on(RoomEvent.ParticipantConnected, refresh);
    room.on(RoomEvent.Disconnected, () => {
      if (!cancelled) setState((s) => ({ ...s, connected: false, videoTrack: null }));
    });

    room
      .connect(wsUrl, token)
      .then(async () => {
        if (cancelled) return;
        if (publish) {
          await room.localParticipant.setCameraEnabled(true);
          await room.localParticipant.setMicrophoneEnabled(true);
        }
        if (!cancelled) {
          setState({ room, connected: true, videoTrack: pickVideoTrack(), error: null });
        }
      })
      .catch((error: Error) => {
        if (!cancelled) setState((s) => ({ ...s, error }));
      });

    return () => {
      cancelled = true;
      void room.disconnect();
      setState(initialState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reconnecting on `publish` toggling would drop the call; it is fixed for a session
  }, [wsUrl, token]);

  const connecting = Boolean(wsUrl && token) && !state.connected && !state.error;

  return { ...state, connecting };
}
