"use client";

import { useEffect, useRef, useState } from "react";
import { Text } from "complexes-next-components";
import { getDeviceId } from "@/app/helpers/device";
import {
  getDevices,
  revokeDeviceTrust,
  deviceLabel,
  type TrustedDevice,
} from "../service/devicesService";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TrustedDevices() {
  const [open, setOpen] = useState(false);
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentDeviceId = getDeviceId();

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDevices();
      // Solo los de confianza: son los que permiten saltarse el OTP y por
      // tanto los únicos sobre los que hay algo que decidir aquí.
      setDevices(data.filter((d) => d.trusted));
    } catch {
      setError("No se pudieron cargar los dispositivos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  // Cerrar al hacer clic fuera del desplegable.
  useEffect(() => {
    if (!open) return;

    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const handleRevoke = async (device: TrustedDevice) => {
    const isCurrent = device.deviceId === currentDeviceId;

    const message = isCurrent
      ? "Este es el dispositivo que estás usando. Si quitas la confianza se cerrará tu sesión y tendrás que verificar el código la próxima vez. ¿Continuar?"
      : "Este dispositivo dejará de ser de confianza y se cerrará su sesión. ¿Continuar?";

    if (!window.confirm(message)) return;

    setRevokingId(device.id);
    setError(null);

    try {
      await revokeDeviceTrust(device.id);

      if (isCurrent) {
        // La sesión actual acaba de morir en el servidor: recargar lleva al
        // login en vez de dejar la pantalla con un token ya inválido.
        window.location.href = "/";
        return;
      }

      setDevices((prev) => prev.filter((d) => d.id !== device.id));
    } catch {
      setError("No se pudo quitar la confianza. Intenta de nuevo.");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="
          flex items-center gap-2 rounded-full border border-cyan-400/20
          bg-white/5 px-4 py-2 text-sm text-cyan-300 backdrop-blur-xl
          transition-colors hover:border-cyan-400/40 hover:text-cyan-200
        "
      >
        Dispositivos de confianza
        <span
          className={`text-xs transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          className="
            absolute right-0 z-50 mt-2 w-[min(92vw,26rem)] overflow-hidden
            rounded-2xl border border-white/10 bg-[#0b1020]/95 p-4
            shadow-[0_0_40px_rgba(34,211,238,0.15)] backdrop-blur-2xl
          "
        >
          <Text className="text-white/70 text-xs mb-3">
            Estos dispositivos no piden código de verificación al iniciar
            sesión. Quita los que no reconozcas.
          </Text>

          {loading && (
            <Text className="text-white/50 text-sm py-3">Cargando…</Text>
          )}

          {error && (
            <Text className="text-red-300 text-sm py-2">{error}</Text>
          )}

          {!loading && !error && devices.length === 0 && (
            <Text className="text-white/50 text-sm py-3">
              No tienes dispositivos de confianza.
            </Text>
          )}

          <ul className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {devices.map((device) => {
              const isCurrent = device.deviceId === currentDeviceId;

              return (
                <li
                  key={device.id}
                  className="
                    flex items-start justify-between gap-3 rounded-xl
                    border border-white/10 bg-white/5 p-3
                  "
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Text className="text-white text-sm font-bold">
                        {deviceLabel(device.userAgent)}
                      </Text>

                      {isCurrent && (
                        <span
                          className="
                            rounded-full border border-cyan-400/30
                            bg-cyan-400/10 px-2 py-[2px] text-[10px]
                            uppercase tracking-wider text-cyan-200
                          "
                        >
                          Este dispositivo
                        </span>
                      )}
                    </div>

                    <Text className="text-white/40 text-xs mt-1">
                      {device.ipAddress ? `IP ${device.ipAddress} · ` : ""}
                      Desde {formatDate(device.createdAt)}
                    </Text>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRevoke(device)}
                    disabled={revokingId === device.id}
                    className="
                      shrink-0 rounded-lg border border-red-400/30
                      bg-red-500/10 px-3 py-1 text-xs text-red-200
                      transition-colors hover:bg-red-500/20
                      disabled:cursor-not-allowed disabled:opacity-50
                    "
                  >
                    {revokingId === device.id ? "Quitando…" : "Quitar"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
