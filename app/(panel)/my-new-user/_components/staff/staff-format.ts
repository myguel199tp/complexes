import type {
  IsoWeekday,
  StaffMember,
  WorkSchedule,
} from "../../services/staffService";

export const STAFF_ROLE_LABELS: Record<string, string> = {
  employee: "Administración",
  porter: "Portería",
  cleaner: "Aseo",
  maintenance: "Mantenimiento",
  gardener: "Jardinería",
  pool_technician: "Piscina",
  accountant: "Contabilidad",
  messenger: "Mensajería",
  logistics_assistant: "Logística",
  community_manager: "Gestión comunitaria",
  event_staff: "Eventos",
  trainer: "Entrenador",
};

export const WEEKDAYS: { day: IsoWeekday; short: string; long: string }[] = [
  { day: 1, short: "Lun", long: "Lunes" },
  { day: 2, short: "Mar", long: "Martes" },
  { day: 3, short: "Mié", long: "Miércoles" },
  { day: 4, short: "Jue", long: "Jueves" },
  { day: 5, short: "Vie", long: "Viernes" },
  { day: 6, short: "Sáb", long: "Sábado" },
  { day: 7, short: "Dom", long: "Domingo" },
];

export type StaffStatusTone = "success" | "warning" | "neutral" | "muted";

/** Estado del colaborador en una palabra, para la tabla y el modal. */
export function staffStatus(member: StaffMember): {
  label: string;
  tone: StaffStatusTone;
} {
  if (!member.active) return { label: "Retirado", tone: "muted" };
  if (!member.canHaveSchedule || !member.shift.hasSchedule) {
    return { label: "Sin horario", tone: "neutral" };
  }
  return member.shift.onShift
    ? { label: "En turno", tone: "success" }
    : { label: "Fuera de turno", tone: "warning" };
}

/** Para fondos siempre blancos (celdas de la tabla y el modal). */
export const STATUS_BADGE: Record<StaffStatusTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  muted: "border-slate-200 bg-slate-100 text-slate-500",
};

const bogotaDateTime = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const bogotaTime = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export const formatDateTime = (iso: string) => bogotaDateTime.format(new Date(iso));
export const formatTime = (iso: string) => bogotaTime.format(new Date(iso));

/** "Lun–Vie 06:00–18:00 · Sáb 06:00–14:00" */
export function describeSchedule(schedule: WorkSchedule | null): string {
  if (!schedule?.slots?.length) return "Sin horario";

  const byDay = WEEKDAYS.map(({ day, short }) => ({
    short,
    ranges: schedule.slots
      .filter((s) => s.day === day)
      .map((s) => `${s.start}–${s.end}`)
      .join(", "),
  }));

  // Junta los días seguidos que tienen las mismas franjas.
  const groups: { from: string; to: string; ranges: string }[] = [];
  for (const d of byDay) {
    const last = groups[groups.length - 1];
    if (d.ranges && last && last.ranges === d.ranges && last.to === prevShort(d.short)) {
      last.to = d.short;
    } else if (d.ranges) {
      groups.push({ from: d.short, to: d.short, ranges: d.ranges });
    }
  }

  return groups
    .map((g) => `${g.from === g.to ? g.from : `${g.from}–${g.to}`} ${g.ranges}`)
    .join(" · ");
}

function prevShort(short: string): string {
  const index = WEEKDAYS.findIndex((w) => w.short === short);
  return index > 0 ? WEEKDAYS[index - 1].short : "";
}

/** Fecha y hora de Bogotá (`YYYY-MM-DD`, `HH:mm`) como ISO. Bogotá es UTC-5 todo el año. */
export function bogotaToIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00-05:00`).toISOString();
}

/** Hoy en Bogotá como `YYYY-MM-DD`. */
export function todayInBogota(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
