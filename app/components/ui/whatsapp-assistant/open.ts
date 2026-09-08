import { Audience, OPEN_EVENT } from "./script";

/**
 * Abre el asistente desde cualquier CTA de la página sin subir el estado ni
 * montar dos burbujas. `audience` se pasa cuando el botón ya delata con quién
 * hablamos —por ejemplo el CTA de la landing de comercios— para ahorrarle al
 * visitante la primera pregunta.
 */
export function openWhatsappAssistant(audience?: Audience) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(OPEN_EVENT, { detail: audience ? { audience } : undefined })
  );
}
