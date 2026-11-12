"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/app/components/ui/form";
import { IoLogoWhatsapp } from "react-icons/io5";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  getWhatsappAlerts,
  updateWhatsappAlerts,
  WhatsappAlertsSettings,
} from "../_lib/whatsapp-alerts";

const QUERY_KEY = ["comercio_whatsapp_alerts"];

/** "+57 300 123 4567": el de Colombia en grupos; los demás, tal cual. */
function prettyPhone(phone: string) {
  const co = phone.match(/^\+57(\d{3})(\d{3})(\d{4})$/);
  return co ? `+57 ${co[1]} ${co[2]} ${co[3]}` : phone;
}

/**
 * Activar los avisos por WhatsApp.
 *
 * El comercio que tiene su propia página no entra al panel a mirar si le
 * pidieron algo; el WhatsApp sí lo mira. Meta exige que lo active él y con el
 * número donde lo quiere, así que esto no viene encendido: se ofrece aquí, en
 * el inicio, donde lo ve apenas entra.
 *
 * Si el servidor todavía no tiene plantillas aprobadas no se muestra nada:
 * ofrecer activar algo que no manda mensajes es peor que no ofrecerlo.
 */
export default function WhatsappAlertsCard() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  const { data } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getWhatsappAlerts,
  });

  // Número en edición; null mientras no se está escribiendo.
  const [draft, setDraft] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: updateWhatsappAlerts,
    onSuccess: (next: WhatsappAlertsSettings) => {
      queryClient.setQueryData(QUERY_KEY, next);
      setDraft(null);
      showAlert(
        next.enabled
          ? "Listo: te llegará un WhatsApp de confirmación."
          : "Apagaste los avisos por WhatsApp.",
        "success",
      );
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  if (!data || (!data.available && !data.enabled)) return null;

  const labels = data.alerts.filter((a) => a.ready).map((a) => a.label);

  // Activo y sin editar: una línea, para no ocupar el inicio con algo resuelto.
  if (data.enabled && draft === null) {
    return (
      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.07] p-4">
        <IoLogoWhatsapp size={24} className="shrink-0 text-emerald-400" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-semibold text-slate-100">
            Avisos por WhatsApp activos
          </span>
          <span className="text-xs text-slate-400">
            Al {data.phone ? prettyPhone(data.phone) : "número de tu perfil"}
          </span>
        </span>
        <div className="flex shrink-0 gap-2">
          <Button
            size="xs"
            rounded="md"
            colVariant="default"
            onClick={() => setDraft(data.phone ?? data.suggestedPhone ?? "")}
          >
            Cambiar número
          </Button>
          <Button
            size="xs"
            rounded="md"
            colVariant="danger"
            disabled={mutation.isLoading}
            onClick={() => mutation.mutate({ enabled: false })}
          >
            Apagar
          </Button>
        </div>
      </div>
    );
  }

  const phone = draft ?? data.phone ?? data.suggestedPhone ?? "";

  return (
    <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.07] p-4">
      <div className="flex items-start gap-3">
        <IoLogoWhatsapp size={24} className="mt-0.5 shrink-0 text-emerald-400" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-100">
            {data.enabled
              ? "Cambiar el número de los avisos"
              : "Que no se te pase ninguna solicitud"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Te escribimos por WhatsApp solo cuando tienes que hacer algo, con el
            enlace para hacerlo:
          </p>
          {labels.length ? (
            <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs text-slate-300">
              {labels.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          ) : null}

          <label className="mt-3 block text-xs text-slate-400">
            Celular con WhatsApp
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+57 300 123 4567"
              className="mt-1 block w-full max-w-xs rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
              value={phone}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>

          <p className="mt-2 text-[11px] text-slate-500">
            Al activarlos aceptas recibir estos avisos de GlobaliaPH por
            WhatsApp en este número. Puedes apagarlos cuando quieras desde aquí.
            Máximo {data.dailyMax} al día; lo demás te sigue llegando por correo
            y en la app.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="xs"
              rounded="md"
              colVariant="success"
              disabled={!phone.trim() || mutation.isLoading}
              onClick={() => mutation.mutate({ enabled: true, phone: phone.trim() })}
            >
              {data.enabled ? "Guardar número" : "Activar avisos por WhatsApp"}
            </Button>
            {data.enabled ? (
              <Button
                size="xs"
                rounded="md"
                colVariant="default"
                onClick={() => setDraft(null)}
              >
                Cancelar
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
