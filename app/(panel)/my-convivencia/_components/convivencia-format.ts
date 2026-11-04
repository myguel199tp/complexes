import type { Tone } from "@/app/(panel)/my-b2b/_components/b2b-ui";
import { CaseEvent, CaseStatus, EventType } from "../services/convivenciaTypes";

export const STATUS_TONE: Record<CaseStatus, Tone> = {
  filed: "neutral",
  assigned: "info",
  summoned: "accent",
  agreement: "success",
  no_agreement: "warning",
  escalated: "warning",
  sanctioned: "danger",
  appealed: "accent",
  closed: "neutral",
};

export const STATUS_OPTIONS: { value: CaseStatus | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "filed", label: "Radicados" },
  { value: "assigned", label: "En mediación" },
  { value: "summoned", label: "Citados" },
  { value: "agreement", label: "Conciliados" },
  { value: "no_agreement", label: "Sin acuerdo" },
  { value: "escalated", label: "Remitidos para sanción" },
  { value: "sanctioned", label: "Sancionados" },
  { value: "appealed", label: "En apelación" },
  { value: "closed", label: "Cerrados" },
];

export const EVENT_LABEL: Record<EventType, string> = {
  filed: "Radicó el caso",
  mediators_assigned: "Asignó encargados",
  respondent_updated: "Actualizó el convocado",
  summoned: "Citó a las partes",
  descargos: "Presentó descargos",
  petitioner_note: "Amplió el caso",
  note: "Nota",
  agreement: "Acta: hubo acuerdo",
  no_agreement: "Acta: sin acuerdo",
  escalated: "Remitió el caso para sanción",
  sanction: "Impuso una sanción",
  appeal: "Apeló la sanción",
  appeal_resolved: "Resolvió la apelación",
  closed: "Cerró el caso",
};

export const ACTOR_LABEL: Record<NonNullable<CaseEvent["actorRole"]>, string> = {
  peticionario: "Peticionario",
  convocado: "Convocado",
  comite: "Comité",
  administracion: "Administración",
  consejo: "Consejo",
};

const TZ = "America/Bogota";

/** Un instante (createdAt, citación) en hora de Bogotá. */
export function fmtDateTime(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleString("es-CO", {
    timeZone: TZ,
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Una fecha sin hora (yyyy-mm-dd) sin correrla de día. */
export function fmtDay(value?: string | null) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : "";
}

/** yyyy-mm-ddThh:mm local → ISO con la zona de Bogotá (UTC-5, sin horario de verano). */
export function bogotaToIso(local: string) {
  return local ? new Date(`${local}:00-05:00`).toISOString() : "";
}

export const isPast = (value?: string | null) => !!value && new Date(value) < new Date();
