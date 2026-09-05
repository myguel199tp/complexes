/**
 * A quién va dirigida una noticia. Espeja `src/new-admin/news-audience.ts` del
 * backend: si aquí se agrega un valor que allá no existe, el DTO lo rechaza.
 */
export enum NewsAudience {
  ALL = "ALL",
  OWNERS = "OWNERS",
  RESIDENTS = "RESIDENTS",
  TOWER = "TOWER",
  STAFF = "STAFF",
}

/**
 * Etiqueta y explicación de cada audiencia.
 *
 * La descripción no es decorativa: "propietarios" y "residentes" suenan igual
 * hasta que alguien cae en la cuenta de que el propietario que arrienda no vive
 * ahí, y es justo la distinción que hace útil el selector.
 */
export const AUDIENCE_OPTIONS: {
  value: NewsAudience;
  label: string;
  hint: string;
}[] = [
  {
    value: NewsAudience.ALL,
    label: "Todo el conjunto",
    hint: "Propietarios, residentes y personal.",
  },
  {
    value: NewsAudience.OWNERS,
    label: "Solo propietarios",
    hint: "Vivan o no en el conjunto. Asambleas, cuotas extraordinarias.",
  },
  {
    value: NewsAudience.RESIDENTS,
    label: "Solo quienes residen",
    hint: "Propietarios que viven ahí, arrendatarios y familia. Convivencia.",
  },
  {
    value: NewsAudience.TOWER,
    label: "Una torre o bloque",
    hint: "Obras, cortes de agua, ascensores.",
  },
  {
    value: NewsAudience.STAFF,
    label: "Solo colaboradores",
    hint: "Portería, aseo, mantenimiento. Turnos e instrucciones internas.",
  },
];

const LABELS: Record<string, string> = AUDIENCE_OPTIONS.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {},
);

/** Texto para mostrar en la lista de noticias ya publicadas. */
export function audienceLabel(
  audience?: string | null,
  tower?: string | null,
): string {
  // Las noticias anteriores a esta función no tienen audiencia: eran para todos.
  if (!audience) return LABELS[NewsAudience.ALL];

  if (audience === NewsAudience.TOWER) {
    return tower ? `Torre ${tower}` : LABELS[NewsAudience.TOWER];
  }

  return LABELS[audience] ?? audience;
}
