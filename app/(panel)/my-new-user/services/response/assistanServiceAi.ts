export interface AiAssistantResponse {
  type: "text" | "table";
  text: string;
  data?: Record<string, unknown>[];

  // 🧠 flujo inteligente IA (opcional)
  meta?: {
    action?: string; // ej: create_provider
    step?: string; // ej: waiting_name
  };
}
