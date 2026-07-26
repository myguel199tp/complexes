"use client";

import { useState } from "react";
import { Title, Text, Buton } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useSidebarInformation } from "@/app/components/ui/sidebar-information";
import {
  useCamerasQuery,
  useCreateCamera,
  useDeleteCamera,
} from "./use-cameras";
import { CreateCameraRequest } from "../services/response/camera";
import CameraPlayer from "./camera-player";

const emptyForm: CreateCameraRequest = {
  name: "",
  location: "",
  brand: "foscam",
  host: "",
  rtspPort: 554,
  rtspPath: "/videoMain",
  username: "",
  password: "",
  transcode: false,
};

export default function Cameras() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const plan = useConjuntoStore((state) => state.plan);
  const { valueState } = useSidebarInformation();

  const canView =
    valueState.userRolName.includes("porter") ||
    valueState.userRolName.includes("employee");
  const isPlatinum = plan === "platinum";
  const enabled = canView && isPlatinum;

  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateCameraRequest>(emptyForm);

  const {
    data: cameras,
    isLoading,
    isError,
  } = useCamerasQuery(conjuntoId, enabled);
  const createMutation = useCreateCamera(conjuntoId);
  const deleteMutation = useDeleteCamera(conjuntoId);

  // ---- Restricciones de acceso ----
  if (!canView) {
    return (
      <div className="p-4">
        <Text size="sm">
          Esta pantalla es exclusiva para portería y administración del
          conjunto.
        </Text>
      </div>
    );
  }

  if (!isPlatinum) {
    return (
      <div className="p-4">
        <Title size="md" font="bold" as="h3" className="mb-2" colVariant="on">
          Cámaras de seguridad
        </Title>
        <Text size="sm">
          El módulo de cámaras está disponible únicamente para conjuntos con
          plan <strong>Platino</strong>. Actualiza tu plan para habilitar esta
          función.
        </Text>
      </div>
    );
  }

  const handleChange = (
    key: keyof CreateCameraRequest,
    value: string | number | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form, {
      onSuccess: () => {
        setForm(emptyForm);
        setShowForm(false);
      },
    });
  };

  const selectedCamera = cameras?.find((c) => c.id === selected);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Title size="md" font="bold" as="h3" colVariant="on">
          Cámaras de seguridad
        </Title>
        <Buton
          borderWidth="none"
          className="bg-cyan-600 text-white px-3 py-1 rounded"
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? "Cerrar" : "Agregar cámara"}
        </Buton>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/5 p-4 rounded-lg"
        >
          <input
            required
            placeholder="Nombre (ej. Portería)"
            className="border rounded px-2 py-1 text-black"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <input
            placeholder="Ubicación (ej. Entrada principal)"
            className="border rounded px-2 py-1 text-black"
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
          />
          <input
            required
            placeholder="IP / Host (ej. 192.168.1.88)"
            className="border rounded px-2 py-1 text-black"
            value={form.host}
            onChange={(e) => handleChange("host", e.target.value)}
          />
          <input
            type="number"
            placeholder="Puerto RTSP (554)"
            className="border rounded px-2 py-1 text-black"
            value={form.rtspPort}
            onChange={(e) => handleChange("rtspPort", Number(e.target.value))}
          />
          <input
            placeholder="Ruta RTSP (/videoMain)"
            className="border rounded px-2 py-1 text-black"
            value={form.rtspPath}
            onChange={(e) => handleChange("rtspPath", e.target.value)}
          />
          <input
            placeholder="Usuario"
            className="border rounded px-2 py-1 text-black"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="border rounded px-2 py-1 text-black"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.transcode}
              onChange={(e) => handleChange("transcode", e.target.checked)}
            />
            <Text size="sm">Transcodificar (cámaras H.265)</Text>
          </label>

          <div className="md:col-span-2">
            <Buton
              type="submit"
              borderWidth="none"
              className="bg-green-600 text-white px-4 py-2 rounded"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Guardando…" : "Guardar cámara"}
            </Buton>
            {createMutation.isError && (
              <Text size="sm" className="text-red-400 mt-2">
                {(createMutation.error as Error).message}
              </Text>
            )}
          </div>
        </form>
      )}

      {isLoading && <Text size="sm">Cargando cámaras…</Text>}
      {isError && (
        <Text size="sm" className="text-red-400">
          No se pudieron cargar las cámaras.
        </Text>
      )}

      {cameras && cameras.length === 0 && (
        <Text size="sm" colVariant="on">
          Aún no hay cámaras registradas.
        </Text>
      )}

      {selectedCamera && (
        <div className="mb-6">
          <CameraPlayer
            key={selectedCamera.id}
            conjuntoId={conjuntoId}
            cameraId={selectedCamera.id}
            cameraName={selectedCamera.name}
          />
          <div className="mt-2">
            <Buton
              borderWidth="none"
              className="underline"
              onClick={() => setSelected(null)}
            >
              Cerrar visor
            </Buton>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cameras?.map((cam) => (
          <div
            key={cam.id}
            className="bg-white/5 rounded-lg p-4 flex flex-col gap-2"
          >
            <Title as="h4" size="sm" font="bold" colVariant="on">
              {cam.name}
            </Title>
            {cam.location && <Text size="sm">{cam.location}</Text>}
            <Text size="sm">
              {cam.host}:{cam.rtspPort}
            </Text>
            <div className="flex gap-2 mt-2">
              <Buton
                borderWidth="none"
                className="bg-cyan-600 text-white px-3 py-1 rounded"
                onClick={() => setSelected(cam.id)}
                disabled={!cam.isActive}
              >
                Ver en vivo
              </Buton>
              <Buton
                borderWidth="none"
                className="bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => {
                  if (confirm(`¿Eliminar la cámara "${cam.name}"?`)) {
                    if (selected === cam.id) setSelected(null);
                    deleteMutation.mutate(cam.id);
                  }
                }}
              >
                Eliminar
              </Buton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
