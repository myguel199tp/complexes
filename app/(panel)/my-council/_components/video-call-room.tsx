"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "complexes-next-components";
import type {
  LocalAudioTrack,
  LocalTrack,
  LocalVideoTrack,
  RemoteParticipant,
  Room,
} from "twilio-video";
import VideoCallParticipantTile from "./video-call-participant-tile";

interface Props {
  accessToken: string;
  onLeave: () => void;
}

export default function VideoCallRoom({ accessToken, onLeave }: Props) {
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const localTracksRef = useRef<LocalTrack[]>([]);
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    let active = true;

    async function connect() {
      try {
        const TwilioVideo = await import("twilio-video");
        const tracks = await TwilioVideo.createLocalTracks({
          audio: true,
          video: { width: 640, height: 480 },
        });

        if (!active) {
          tracks.forEach((t) => {
            if (t.kind !== "data") t.stop();
          });
          return;
        }
        localTracksRef.current = tracks;

        const videoTrack = tracks.find(
          (t): t is LocalVideoTrack => t.kind === "video",
        );
        if (videoTrack && localVideoRef.current) {
          localVideoRef.current.appendChild(videoTrack.attach());
        }

        const newRoom = await TwilioVideo.connect(accessToken, { tracks });

        if (!active) {
          newRoom.disconnect();
          return;
        }

        roomRef.current = newRoom;
        setRemoteParticipants(Array.from(newRoom.participants.values()));
        setConnecting(false);

        newRoom.on("participantConnected", (p) =>
          setRemoteParticipants((prev) => [...prev, p]),
        );
        newRoom.on("participantDisconnected", (p) =>
          setRemoteParticipants((prev) => prev.filter((x) => x !== p)),
        );
      } catch (err) {
        if (active) {
          const message = err instanceof Error ? err.message : undefined;
          setError(message || "No se pudo conectar a la videollamada");
          setConnecting(false);
        }
      }
    }

    connect();

    return () => {
      active = false;
      localTracksRef.current.forEach((t) => {
        if (t.kind === "data") return;
        t.stop();
        t.detach().forEach((el) => el.remove());
      });
      roomRef.current?.disconnect();
      roomRef.current = null;
    };
  }, [accessToken]);

  const toggleMic = () => {
    localTracksRef.current
      .filter((t): t is LocalAudioTrack => t.kind === "audio")
      .forEach((t) => (micOn ? t.disable() : t.enable()));
    setMicOn((v) => !v);
  };

  const toggleCam = () => {
    localTracksRef.current
      .filter((t): t is LocalVideoTrack => t.kind === "video")
      .forEach((t) => (camOn ? t.disable() : t.enable()));
    setCamOn((v) => !v);
  };

  const handleLeave = () => {
    roomRef.current?.disconnect();
    onLeave();
  };

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-400">{error}</p>
        <Button size="sm" colVariant="danger" rounded="md" onClick={onLeave}>
          Cerrar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {connecting && (
        <p className="text-sm text-gray-300">Conectando a la videollamada...</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <div
            ref={localVideoRef}
            className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
          />
          <span className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded">
            Tú
          </span>
        </div>
        {remoteParticipants.map((p) => (
          <VideoCallParticipantTile key={p.sid} participant={p} label={p.identity} />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          rounded="md"
          colVariant={micOn ? "primary" : "danger"}
          onClick={toggleMic}
        >
          {micOn ? "🎤 Mic" : "🔇 Mic"}
        </Button>
        <Button
          size="sm"
          rounded="md"
          colVariant={camOn ? "primary" : "danger"}
          onClick={toggleCam}
        >
          {camOn ? "📷 Cámara" : "🚫 Cámara"}
        </Button>
        <Button size="sm" rounded="md" colVariant="danger" onClick={handleLeave}>
          Salir
        </Button>
      </div>
    </div>
  );
}
