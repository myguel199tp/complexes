"use client";
import { useEffect, useState } from "react";
import { Text } from "complexes-next-components";
import {
  MEETING_MAX_DURATION_MINUTES,
  MeetingResponse,
  meetingDeadline,
} from "../services/response/councilResponse";

/** Minutos que faltan para la hora límite; se recalcula cada 30 segundos. */
export function useMeetingMinutesLeft(meeting: MeetingResponse) {
  const deadline = meetingDeadline(meeting).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  return Math.ceil((deadline - now) / 60_000);
}

function formatLeft(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return h ? `${h} h ${m} min` : `${m} min`;
}

/**
 * Cuánto le queda a la reunión en curso. Al cumplir el tiempo máximo el
 * backend la cierra con los votos emitidos y deja en el acta quién no votó.
 */
export default function MeetingTimeLimit({
  meeting,
  minutesLeft,
}: {
  meeting: MeetingResponse;
  minutesLeft: number;
}) {
  const hours = MEETING_MAX_DURATION_MINUTES / 60;
  const closesAt = meetingDeadline(meeting).toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (minutesLeft <= 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <Text size="sm" font="semi" className="text-red-800">
          Se cumplieron las {hours} horas de la reunión
        </Text>
        <Text size="xs" className="mt-0.5 text-red-700">
          Ya no recibe votos y se cerrará en unos minutos con lo votado. En el
          acta quedará quién no votó.
        </Text>
      </div>
    );
  }

  const urgent = minutesLeft <= 15;

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        urgent ? "border-amber-200 bg-amber-50" : "border-cyan-200 bg-cyan-50"
      }`}
    >
      <Text
        size="sm"
        font="semi"
        className={urgent ? "text-amber-800" : "text-cyan-800"}
      >
        Quedan {formatLeft(minutesLeft)} · se cierra a las {closesAt}
      </Text>
      <Text
        size="xs"
        className={`mt-0.5 ${urgent ? "text-amber-700" : "text-cyan-700"}`}
      >
        Las reuniones duran máximo {hours} horas. Si no se finaliza antes, se
        cierra sola con los votos emitidos y el acta dice quién no votó.
      </Text>
    </div>
  );
}
