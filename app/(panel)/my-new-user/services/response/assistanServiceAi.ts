export interface AiAssistantResponse {
  type: "text" | "table";
  text: string;
  data?: Record<string, unknown>[];

  /**
   * Identificador de esta respuesta, para poder calificarla.
   *
   * Solo llega cuando el backend consiguió registrarla, así que los pulgares se
   * pintan únicamente si viene: ofrecer un botón que no podría guardar nada es
   * peor que no ofrecerlo. Tampoco viene en el "no entendí", y ahí es lo
   * correcto —esa respuesta ya se anota sola como fallo, y preguntar "¿te
   * sirvió?" después de no responder sobra—.
   */
  usageId?: string;

  // 🧠 flujo inteligente IA (opcional)
  meta?: {
    action?: string; // ej: create_provider
    step?: string; // ej: waiting_name
  };
}
