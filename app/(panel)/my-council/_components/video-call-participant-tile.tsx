"use client";
import { useEffect, useRef } from "react";

interface Props {
  participant: any;
  label: string;
}

export default function VideoCallParticipantTile({ participant, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const attach = (track: any) => {
      if (track.kind === "video" || track.kind === "audio") {
        container.appendChild(track.attach());
      }
    };
    const detach = (track: any) => {
      track.detach?.().forEach((el: HTMLMediaElement) => el.remove());
    };

    participant.tracks.forEach((publication: any) => {
      if (publication.track) attach(publication.track);
    });

    const onTrackSubscribed = (track: any) => attach(track);
    const onTrackUnsubscribed = (track: any) => detach(track);

    participant.on("trackSubscribed", onTrackSubscribed);
    participant.on("trackUnsubscribed", onTrackUnsubscribed);

    return () => {
      participant.off("trackSubscribed", onTrackSubscribed);
      participant.off("trackUnsubscribed", onTrackUnsubscribed);
      participant.tracks.forEach((publication: any) => {
        if (publication.track) detach(publication.track);
      });
    };
  }, [participant]);

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover [&>audio]:hidden"
      />
      <span className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded">
        {label}
      </span>
    </div>
  );
}
