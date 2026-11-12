import { comercioFetch } from "./comercio-api";

/** Un aviso que puede llegarle por WhatsApp, según su modelo de negocio. */
export interface WhatsappAlertOption {
  alert: string;
  label: string;
  /** Si la plantilla ya está aprobada y configurada en el servidor. */
  ready: boolean;
}

export interface WhatsappAlertsSettings {
  enabled: boolean;
  /** El número de los avisos, en formato internacional. */
  phone: string | null;
  optInAt: string | null;
  /** El de su perfil, para no tener que escribirlo. */
  suggestedPhone: string | null;
  /** Si hoy saldría algo: sin esto el panel no ofrece activarlo. */
  available: boolean;
  alerts: WhatsappAlertOption[];
  dailyMax: number;
}

export function getWhatsappAlerts() {
  return comercioFetch<WhatsappAlertsSettings>("/comercio/whatsapp-alerts");
}

export function updateWhatsappAlerts(data: { enabled: boolean; phone?: string }) {
  return comercioFetch<WhatsappAlertsSettings>("/comercio/whatsapp-alerts", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
