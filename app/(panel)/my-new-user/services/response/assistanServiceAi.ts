export interface AiAssistantResponse {
  type: "text" | "table";
  text: string;
  data?: Record<string, unknown>[];
}
