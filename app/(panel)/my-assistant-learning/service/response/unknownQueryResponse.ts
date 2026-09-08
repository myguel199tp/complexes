/**
 * Una pregunta que el asistente no supo responder.
 *
 * `count` es lo que ordena la lista: el backend agrupa las repetidas por su
 * texto normalizado, así que una consulta que llega cada día se distingue de
 * la que alguien escribió una vez.
 */
export interface UnknownQueryResponse {
  id: string;
  /** La pregunta tal como se escribió. Se guarda la última de las repetidas. */
  message: string;
  /** Sin tildes ni mayúsculas. Es la clave por la que se agrupan. */
  normalized: string;
  count: number;
  reviewed: boolean;
  lastAskedAt: string | null;
  createdAt: string;
}
