"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, InputField, Text, Title } from "complexes-next-components";

import { useComercioGuard } from "../../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  getEngineLink,
  removeEngineLink,
  saveEngineLink,
  toggleEngineLink,
} from "../services/engineLinkService";

const QUERY_KEY = ["comercio_engine_link"];

/**
 * Conecta el comercio con su asistente para clientes (ai-assistant-engine).
 *
 * El asistente del dueño (la pantalla anterior) contesta al comercio sobre su
 * negocio. Este otro atiende a sus CLIENTES en su web, en su página pública y
 * en los encargos que le llegan de agentes personales, y con la conexión les
 * responde con el catálogo real: precio, disponibilidad y promociones del día.
 */
export default function EngineConnectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const { session } = useComercioGuard(() => router.push("/comercio/login"));

  const [tenantId, setTenantId] = useState("");
  const [secret, setSecret] = useState("");
  const [serverKey, setServerKey] = useState("");

  const { data: link, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getEngineLink,
    enabled: session !== null,
  });

  const refresh = (next: unknown) => queryClient.setQueryData(QUERY_KEY, next);

  const save = useMutation({
    mutationFn: () =>
      saveEngineLink({
        tenantId: tenantId.trim(),
        secret: secret.trim(),
        serverKey: serverKey.trim() || undefined,
      }),
    onSuccess: (next) => {
      refresh(next);
      // Las claves no se quedan en pantalla: ya están guardadas y cifradas.
      setSecret("");
      setServerKey("");
      showAlert("Conexión guardada", "success");
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const toggle = useMutation({
    mutationFn: (enabled: boolean) => toggleEngineLink(enabled),
    onSuccess: refresh,
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const remove = useMutation({
    mutationFn: removeEngineLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showAlert("Asistente desconectado", "success");
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const copyUrl = async () => {
    if (!link?.connectorUrl) return;
    try {
      await navigator.clipboard.writeText(link.connectorUrl);
      showAlert("URL copiada", "success");
    } catch {
      showAlert("No se pudo copiar; selecciónala y cópiala a mano", "error");
    }
  };

  if (session === null || isLoading) {
    return <div className="p-4 text-center text-slate-300">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link href="/comercio/assistant" className="text-sm text-cyan-400">
            ← Volver al asistente
          </Link>
          <Title as="h1" size="lg" colVariant="on" font="semi" className="mt-2">
            Asistente para tus clientes
          </Title>
          <Text size="sm" className="mt-2 text-slate-400">
            Conecta tu asistente para clientes y responderá en tu web, en tu página pública y en
            los encargos con tu catálogo real: precios, disponibilidad y promociones vigentes. Solo
            comparte lo que ya publicas en la app; los pedidos de un cliente solo se los muestra a
            ese cliente.
          </Text>
        </div>

        {/* ESTADO */}
        {link?.connected ? (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2">
              <Badge colVariant={link.enabled ? "success" : "default"} size="xs">
                {link.enabled ? "Conectado" : "En pausa"}
              </Badge>
              <span className="text-sm text-slate-300">{link.tenantId}</span>
            </div>

            <Text size="sm" className="text-slate-400">
              {link.residentChatReady
                ? "Tus clientes de los conjuntos ya pueden preguntarle por sus pedidos desde la ficha de tu tienda."
                : link.hasServerKey
                  ? "Tienes la clave de servidor, pero el chat para residentes todavía no está disponible en la plataforma."
                  : "Sin clave de servidor, el asistente contesta precios y promociones, pero no los pedidos de cada cliente."}
            </Text>

            <Text size="sm" className="text-slate-400">
              {link.lastCallAt
                ? `Última consulta de tu asistente: ${new Date(link.lastCallAt).toLocaleString("es-CO")}`
                : "Todavía no ha llegado ninguna consulta. Prueba con \"Probar conexión\" en el panel de tu asistente."}
            </Text>

            <div className="flex flex-wrap gap-2">
              <Button
                size="xs"
                rounded="md"
                disabled={toggle.isPending}
                onClick={() => toggle.mutate(!link.enabled)}
              >
                {link.enabled ? "Pausar" : "Reanudar"}
              </Button>
              <Button
                size="xs"
                rounded="md"
                colVariant="danger"
                disabled={remove.isPending}
                onClick={() => remove.mutate()}
              >
                Desconectar
              </Button>
            </div>
          </div>
        ) : null}

        {/* PASOS */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <Text size="sm" className="font-semibold text-slate-200">
            {link?.connected ? "Cambiar la conexión" : "Cómo conectarlo"}
          </Text>

          <ol className="list-decimal space-y-3 pl-5 text-sm text-slate-300">
            <li>Entra al panel de tu asistente para clientes, pestaña <strong>Tus datos</strong>.</li>
            <li>
              Pega esta dirección como URL del conector:
              {link?.connectorUrl ? (
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 overflow-x-auto rounded-lg bg-black/40 px-3 py-2 text-xs text-cyan-300">
                    {link.connectorUrl}
                  </code>
                  <Button size="xs" rounded="md" onClick={copyUrl}>
                    Copiar
                  </Button>
                </div>
              ) : (
                <span className="mt-1 block text-amber-300">
                  La dirección no está configurada en el servidor (falta API_URL). Pídela a soporte.
                </span>
              )}
            </li>
            <li>
              El panel te mostrará un secreto que empieza por <code>whsec_</code>. Cópialo aquí abajo
              junto con el identificador de tu asistente.
            </li>
            <li>
              Para que tus clientes pregunten por <strong>sus pedidos</strong>, crea una clave en{" "}
              <strong>Claves de servidor</strong> (empieza por <code>sk_live_</code>) y pégala también.
              Es opcional.
            </li>
          </ol>

          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <InputField
              inputSize="sm"
              rounded="lg"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="Identificador del asistente (ej. panaderia-la-14)"
              maxLength={120}
              className="text-white"
            />
            <InputField
              inputSize="sm"
              rounded="lg"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Secreto (whsec_…)"
              autoComplete="off"
              className="text-white"
            />
            <InputField
              inputSize="sm"
              rounded="lg"
              type="password"
              value={serverKey}
              onChange={(e) => setServerKey(e.target.value)}
              placeholder={
                link?.hasServerKey
                  ? "Clave de servidor guardada (déjalo vacío para conservarla)"
                  : "Clave de servidor, opcional (sk_live_…)"
              }
              autoComplete="off"
              className="text-white"
            />
            <Button
              type="submit"
              size="sm"
              rounded="md"
              disabled={save.isPending || !tenantId.trim() || !secret.trim()}
            >
              {link?.connected ? "Guardar cambios" : "Conectar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
