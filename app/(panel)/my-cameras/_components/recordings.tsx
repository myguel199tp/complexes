"use client";

import { useMemo, useState } from "react";
import { Title, Text, Buton, InputField, SelectField } from "complexes-next-components";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useSidebarInformation } from "@/app/components/ui/sidebar-information";
import { useCamerasQuery } from "./use-cameras";
import {
  useRecordingAccess,
  useRecordingAccessLog,
  useRecordingDays,
  useRecordingUsage,
  useRecordingsQuery,
  useRequestRecordingOtp,
  useRevokeRecordingAccess,
  useVerifyRecordingOtp,
} from "./use-recordings";
import { RecordingResponse } from "../services/response/recording";
import RecordingPlayer from "./recording-player";

/** `YYYY-MM-DD` de hoy en horario local, para el valor inicial del filtro. */
function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Recordings() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const plan = useConjuntoStore((state) => state.plan);
  const { valueState } = useSidebarInformation();

  // Sólo administración. La portería mira el vivo, no el archivo.
  const isEmployee = valueState.userRolName.includes("employee");
  const planHasCameras = plan === "gold" || plan === "platinum";
  const enabled = isEmployee && planHasCameras && !!conjuntoId;

  const [day, setDay] = useState(todayISO());
  const [cameraId, setCameraId] = useState("");
  const [code, setCode] = useState("");
  const [selected, setSelected] = useState<RecordingResponse | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [otpSentTo, setOtpSentTo] = useState<string | null>(null);

  const { data: access } = useRecordingAccess(conjuntoId, enabled);
  const unlocked = Boolean(access?.unlocked);

  const { data: usage, error: usageError } = useRecordingUsage(
    conjuntoId,
    enabled,
  );
  const { data: cameras } = useCamerasQuery(conjuntoId, enabled);
  const { data: days } = useRecordingDays(
    conjuntoId,
    cameraId || undefined,
    enabled,
  );

  // El día elegido se convierte en el rango completo en horario local: el
  // backend guarda instantes, y filtrar por texto de fecha dejaría fuera la
  // última hora según la zona.
  const range = useMemo(() => {
    const from = new Date(`${day}T00:00:00`);
    const to = new Date(`${day}T23:59:59.999`);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [day]);

  const { data: recordings, isLoading } = useRecordingsQuery(
    conjuntoId,
    { ...range, cameraId: cameraId || undefined, limit: 300 },
    enabled,
  );

  const { data: accessLog } = useRecordingAccessLog(
    conjuntoId,
    enabled && showLog,
  );

  const requestOtp = useRequestRecordingOtp(conjuntoId);
  const verifyOtp = useVerifyRecordingOtp(conjuntoId);
  const revoke = useRevokeRecordingAccess(conjuntoId);

  // ---- Restricciones de acceso ----

  if (!isEmployee) {
    return (
      <div className="p-4">
        <Text colVariant="on" size="sm">
          Las grabaciones sólo puede consultarlas la administración del
          conjunto.
        </Text>
      </div>
    );
  }

  if (!planHasCameras) {
    return (
      <div className="p-4">
        <Text colVariant="on" size="sm">
          El módulo de cámaras requiere plan <strong>Gold</strong> o{" "}
          <strong>Platino</strong>.
        </Text>
      </div>
    );
  }

  // El backend responde 403 con este mensaje cuando el conjunto no tiene el
  // servicio contratado; es la vía por la que la pantalla ofrece el alta.
  const notContracted =
    usageError && (usageError as { status?: number }).status === 403;

  if (notContracted) {
    return (
      <div className="p-4">
        <Title size="md" font="bold" as="h3" className="mb-2" colVariant="on">
          Grabación de cámaras
        </Title>
        <div className="max-w-2xl rounded-lg bg-white/5 p-4 text-slate-700 dark:text-slate-200">
          <Text size="sm" className="mb-3">
            El conjunto no tiene contratado el servicio de grabación. Con él,
            las cámaras que elijas guardan video en continuo y puedes revisar lo
            que pasó en los días anteriores.
          </Text>
          <Text size="sm" className="mb-3">
            Se cobra aparte del plan porque consume almacenamiento aunque nadie
            esté mirando: se factura por cámara con grabación activa, y se
            pactan los días de retención y el tope de espacio.
          </Text>
          <Text size="sm">
            Escríbenos para activarlo en tu conjunto.
          </Text>
        </div>
      </div>
    );
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtp.mutate(code, { onSuccess: () => setCode("") });
  };

  const handleRequest = () => {
    requestOtp.mutate(undefined, {
      onSuccess: (res) => setOtpSentTo(res.email),
    });
  };

  const daysWithVideo = new Set(days?.map((d) => d.day) ?? []);

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Title size="md" font="bold" as="h3" colVariant="on">
          Grabaciones
        </Title>
        <div className="flex gap-2">
          <Buton
            borderWidth="none"
            className="rounded border border-cyan-600 px-3 py-1 text-cyan-600"
            onClick={() => setShowLog((s) => !s)}
          >
            {showLog ? "Ocultar bitácora" : "Bitácora de accesos"}
          </Buton>
          {unlocked && (
            <Buton
              borderWidth="none"
              className="rounded border border-slate-400 px-3 py-1 text-slate-500"
              onClick={() => {
                setSelected(null);
                revoke.mutate();
              }}
            >
              Bloquear
            </Buton>
          )}
        </div>
      </div>

      {/* ---- Consumo y costo ---- */}
      {usage && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white/5 p-3 text-slate-700 dark:text-slate-200">
            <Text size="sm">Cámaras grabando</Text>
            <Text size="lg" font="bold">
              {usage.camerasRecording}
            </Text>
          </div>
          <div className="rounded-lg bg-white/5 p-3 text-slate-700 dark:text-slate-200">
            <Text size="sm">Almacenamiento</Text>
            <Text size="lg" font="bold">
              {usage.storageGb} GB
            </Text>
            <Text size="sm">
              de {usage.maxStorageGb} GB ({usage.storageUsedPercent}%)
            </Text>
          </div>
          <div className="rounded-lg bg-white/5 p-3 text-slate-700 dark:text-slate-200">
            <Text size="sm">Retención</Text>
            <Text size="lg" font="bold">
              {usage.retentionDays} días
            </Text>
            <Text size="sm">{usage.hoursStored} h guardadas</Text>
          </div>
          <div className="rounded-lg bg-white/5 p-3 text-slate-700 dark:text-slate-200">
            <Text size="sm">Costo estimado / mes</Text>
            <Text size="lg" font="bold">
              {usage.billing.estimatedMonthlyAmount.toLocaleString()}{" "}
              {usage.billing.currency}
            </Text>
            {usage.billing.simulated && (
              // Decirlo evita que la administración crea que ya se le cobró.
              <Text size="sm" className="text-amber-600 dark:text-amber-400">
                Valor estimado, aún no facturado
              </Text>
            )}
          </div>
        </div>
      )}

      {/* ---- Segundo factor ---- */}
      {!unlocked && (
        <div className="mb-6 max-w-xl rounded-lg bg-white/5 p-4 text-slate-700 dark:text-slate-200">
          <Title
            as="h4"
            size="sm"
            font="bold"
            className="mb-2 text-slate-900 dark:text-white"
          >
            Verifica tu identidad
          </Title>
          <Text size="sm" className="mb-3">
            Las grabaciones contienen imágenes de residentes y visitantes. Para
            abrirlas te enviamos un código a tu correo; el acceso queda abierto
            15 minutos y cada reproducción se registra con tu nombre.
          </Text>

          {!otpSentTo ? (
            <Buton
              borderWidth="none"
              className="rounded bg-cyan-600 px-3 py-1 text-white"
              onClick={handleRequest}
              disabled={requestOtp.isPending}
            >
              {requestOtp.isPending ? "Enviando…" : "Enviarme el código"}
            </Buton>
          ) : (
            <form onSubmit={handleVerify} className="flex flex-col gap-3">
              <Text size="sm">
                Enviamos un código a <strong>{otpSentTo}</strong>.
              </Text>
              <InputField
                id="recording-otp"
                placeholder="000000"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
              <div className="flex gap-2">
                <Buton
                  type="submit"
                  borderWidth="none"
                  className="rounded bg-cyan-600 px-3 py-1 text-white"
                  disabled={code.length !== 6 || verifyOtp.isPending}
                >
                  {verifyOtp.isPending ? "Validando…" : "Desbloquear"}
                </Buton>
                <Buton
                  type="button"
                  borderWidth="none"
                  className="rounded border border-cyan-600 px-3 py-1 text-cyan-600"
                  onClick={handleRequest}
                  disabled={requestOtp.isPending}
                >
                  Reenviar
                </Buton>
              </div>
            </form>
          )}

          {(requestOtp.error || verifyOtp.error) && (
            <Text size="sm" className="mt-2 text-red-500">
              {(requestOtp.error as Error)?.message ??
                (verifyOtp.error as Error)?.message}
            </Text>
          )}
        </div>
      )}

      {unlocked && access?.sessionExpiresAt && (
        <Text size="sm" className="mb-4 text-emerald-600 dark:text-emerald-400">
          Acceso habilitado hasta{" "}
          {new Date(access.sessionExpiresAt).toLocaleTimeString()}
        </Text>
      )}

      {/* ---- Filtros ---- */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-44">
          <InputField
            id="recording-day"
            type="date"
            value={day}
            onChange={(e) => {
              setDay(e.target.value);
              setSelected(null);
            }}
          />
        </div>
        <div className="w-56">
          <SelectField
            id="recording-camera"
            value={cameraId}
            onChange={(e) => {
              setCameraId(e.target.value);
              setSelected(null);
            }}
            options={[
              { value: "", label: "Todas las cámaras" },
              ...(cameras ?? []).map((c) => ({
                value: c.id,
                label: c.name,
              })),
            ]}
          />
        </div>
      </div>

      {days && days.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {days.slice(0, 14).map((d) => (
            <button
              key={d.day}
              type="button"
              onClick={() => {
                setDay(d.day);
                setSelected(null);
              }}
              className={`rounded px-2 py-1 text-xs ${
                d.day === day
                  ? "bg-cyan-600 text-white"
                  : "bg-white/10 text-slate-600 dark:text-slate-300"
              }`}
            >
              {d.day} ({d.count})
            </button>
          ))}
        </div>
      )}

      {/* ---- Reproductor ---- */}
      {selected && unlocked && (
        <div className="mb-6">
          <RecordingPlayer conjuntoId={conjuntoId} recording={selected} />
        </div>
      )}

      {/* ---- Listado ---- */}
      {isLoading && (
        <Text colVariant="on" size="sm">
          Cargando grabaciones…
        </Text>
      )}

      {!isLoading && recordings && recordings.items.length === 0 && (
        <Text colVariant="on" size="sm">
          {daysWithVideo.size === 0
            ? "Todavía no hay grabaciones. Activa la grabación en la ficha de cada cámara."
            : "No hay grabaciones para ese día y esa cámara."}
        </Text>
      )}

      {recordings && recordings.items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="py-1 pr-4">Hora</th>
                <th className="py-1 pr-4">Cámara</th>
                <th className="py-1 pr-4">Duración</th>
                <th className="py-1 pr-4">Tamaño</th>
                <th className="py-1 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {recordings.items.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-slate-200 dark:border-white/10"
                >
                  <td className="py-1 pr-4 whitespace-nowrap">
                    <Text size="sm">
                      {new Date(r.startedAt).toLocaleTimeString()}
                    </Text>
                  </td>
                  <td className="py-1 pr-4">
                    <Text size="sm">{r.cameraName}</Text>
                  </td>
                  <td className="py-1 pr-4">
                    <Text size="sm">{formatDuration(r.durationSec)}</Text>
                  </td>
                  <td className="py-1 pr-4">
                    <Text size="sm">{formatSize(r.sizeBytes)}</Text>
                  </td>
                  <td className="py-1 pr-4">
                    <Buton
                      borderWidth="none"
                      className="rounded bg-cyan-600 px-2 py-1 text-xs text-white disabled:opacity-50"
                      disabled={!unlocked}
                      title={
                        unlocked
                          ? undefined
                          : "Verifica el código enviado a tu correo"
                      }
                      onClick={() => setSelected(r)}
                    >
                      Ver
                    </Buton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Text size="sm" className="mt-2 text-slate-500">
            {recordings.items.length} de {recordings.total} grabaciones
          </Text>
        </div>
      )}

      {/* ---- Bitácora ---- */}
      {showLog && (
        <div className="mt-8">
          <Title
            as="h4"
            size="sm"
            font="bold"
            className="mb-2"
            colVariant="on"
          >
            Quién ha visto grabaciones
          </Title>
          {accessLog && accessLog.items.length === 0 && (
            <Text colVariant="on" size="sm">
              Nadie ha reproducido grabaciones todavía.
            </Text>
          )}
          {accessLog && accessLog.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 dark:text-slate-400">
                    <th className="py-1 pr-4">Cuándo</th>
                    <th className="py-1 pr-4">Usuario</th>
                    <th className="py-1 pr-4">Cámara</th>
                    <th className="py-1 pr-4">Grabación</th>
                  </tr>
                </thead>
                <tbody>
                  {accessLog.items.map((log) => (
                    <tr
                      key={log.id}
                      className="border-t border-slate-200 dark:border-white/10"
                    >
                      <td className="py-1 pr-4 whitespace-nowrap">
                        <Text size="sm">
                          {new Date(log.createdAt).toLocaleString()}
                        </Text>
                      </td>
                      <td className="py-1 pr-4">
                        <Text size="sm">{log.userEmail ?? log.userId}</Text>
                      </td>
                      <td className="py-1 pr-4">
                        <Text size="sm">{log.cameraName ?? "—"}</Text>
                      </td>
                      <td className="py-1 pr-4 whitespace-nowrap">
                        <Text size="sm">
                          {new Date(log.recordingStartedAt).toLocaleString()}
                        </Text>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
