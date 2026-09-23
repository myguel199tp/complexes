/** Una respuesta que el conjunto le tiene enseñada a su asistente. */
export interface KnowledgeEntry {
  id: string;
  question: string;
  /** Otras formas de preguntar lo mismo. Son lo que sube el acierto. */
  aliases: string[];
  answer: string;
  /** Vacío significa "la ve cualquiera que use el asistente". */
  roles: string[];
  /** Apagada deja de responderse, pero el texto se conserva. */
  active: boolean;
  /** `manual` o `unknown_query`, según si nació de una pregunta sin responder. */
  source: string;
  /** Veces que esta entrada respondió de verdad. */
  hits: number;
  lastUsedAt: string | null;
  createdAt: string;
}

/**
 * Una pregunta que el asistente no supo responder en este conjunto.
 *
 * Es la cola de trabajo de la pantalla: cada fila es una respuesta que falta,
 * escrita con las palabras de quien la necesitaba.
 */
export interface UnknownQuery {
  id: string;
  message: string;
  /** Cuántas veces la han preguntado aquí. Es lo que ordena la lista. */
  count: number;
  lastAskedAt: string | null;
  createdAt: string;
}

export interface KnowledgePayload {
  question: string;
  answer: string;
  aliases?: string[];
  roles?: string[];
  /** De qué pregunta sin responder nació, si se creó desde la cola. */
  sourceQueryId?: string;
}
