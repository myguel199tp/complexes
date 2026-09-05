"use client";

import { useState } from "react";
import {
  Title,
  Text,
  Buton,
  InputField,
  SelectField,
} from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useSidebarInformation } from "@/app/components/ui/sidebar-information";
import {
  useCameraBrandsQuery,
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

  const isEmployee = valueState.userRolName.includes("employee");
  // Portería sólo mira; agregar y eliminar cámaras es de la administración.
  const canView = valueState.userRolName.includes("porter") || isEmployee;
  const canManage = isEmployee;
  const planHasCameras = plan === "gold" || plan === "platinum";
  const enabled = canView && planHasCameras;

  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [form, setForm] = useState<CreateCameraRequest>(emptyForm);

  const {
    data: cameras,
    isLoading,
    isError,
  } = useCamerasQuery(conjuntoId, enabled);
  const { data: brands } = useCameraBrandsQuery(conjuntoId, enabled);
  const createMutation = useCreateCamera(conjuntoId);
  const deleteMutation = useDeleteCamera(conjuntoId);

  const brandOptions =
    brands?.map((b) => ({ value: b.key, label: b.label })) ?? [];
  const currentBrand = brands?.find((b) => b.key === form.brand);

  // ---- Restricciones de acceso ----
  if (!canView) {
    return (
      <div className="p-4">
        <Text colVariant="on" size="sm">
          Esta pantalla es exclusiva para portería y administración del
          conjunto.
        </Text>
      </div>
    );
  }

  if (!planHasCameras) {
    return (
      <div className="p-4">
        <Title size="md" font="bold" as="h3" className="mb-2" colVariant="on">
          Cámaras de seguridad
        </Title>
        <Text colVariant="on" size="sm">
          El módulo de cámaras está disponible únicamente para conjuntos con
          plan <strong>Gold</strong> o <strong>Platino</strong>. Actualiza tu
          plan para habilitar esta función.
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

  /**
   * Al elegir marca se rellenan puerto y ruta con los valores de fábrica de ese
   * fabricante; siguen siendo editables por si la cámara está configurada a
   * mano o cuelga de un NVR con otro canal.
   */
  const handleBrandChange = (key: string) => {
    const brand = brands?.find((b) => b.key === key);
    setForm((prev) => ({
      ...prev,
      brand: key,
      rtspPort: brand?.defaultPort ?? prev.rtspPort,
      rtspPath: brand?.mainPath ?? prev.rtspPath,
    }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // El backend valida `brand` contra el catálogo: mandar la opción vacía del
    // selector daría 400, así que en ese caso se omite y queda el default.
    const payload = { ...form, brand: form.brand || undefined };
    createMutation.mutate(payload, {
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
        <div className="flex gap-2">
          <Buton
            borderWidth="none"
            className="border border-cyan-600 text-cyan-600 px-3 py-1 rounded"
            onClick={() => setShowGuide((s) => !s)}
          >
            {showGuide ? "Ocultar compatibilidad" : "¿Qué cámaras sirven?"}
          </Buton>
          {canManage && (
            <Buton
              borderWidth="none"
              className="bg-cyan-600 text-white px-3 py-1 rounded"
              onClick={() => setShowForm((s) => !s)}
            >
              {showForm ? "Cerrar" : "Agregar cámara"}
            </Buton>
          )}
        </div>
      </div>

      {/* El color se pone en el contenedor y no en cada `Text`: el `colVariant`
          por defecto de la librería compila a `text-black-500`, que no existe
          en Tailwind, así que los hijos heredan. La regla de tema claro de
          globals.css tampoco llega hasta aquí —esta tarjeta tiene fondo propio
          (`bg-`)—, por eso el par claro/oscuro va escrito a mano. */}
      {showGuide && (
        <div className="mb-6 bg-white/5 p-4 rounded-lg text-slate-700 dark:text-slate-200">
          <Title
            as="h4"
            size="sm"
            font="bold"
            className="mb-2 text-slate-900 dark:text-white"
          >
            Cámaras compatibles
          </Title>
          <Text size="sm" className="mb-3">
            Sirve <strong>cualquier cámara IP que entregue RTSP</strong>: el
            servidor toma ese flujo y lo convierte a video para el navegador. No
            hace falta que sea de una marca concreta. Requisitos:
          </Text>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>
              <Text size="sm">
                RTSP habilitado en la cámara y un usuario con permiso de ver
                video (en varias marcas viene apagado de fábrica).
              </Text>
            </li>
            <li>
              <Text size="sm">
                Que el servidor alcance la cámara por red: IP fija en la LAN del
                conjunto, o el puerto RTSP publicado hacia afuera.
              </Text>
            </li>
            <li>
              <Text size="sm">
                Video en <strong>H.264</strong>. Si la cámara graba en H.265 /
                HEVC (típico en 4K) hay que marcar &quot;Transcodificar&quot;, o
                usar el stream secundario, que casi siempre es H.264.
              </Text>
            </li>
            <li>
              <Text size="sm">
                El audio no se transmite; sólo video.
              </Text>
            </li>
            <li>
              <Text size="sm">
                Las cámaras que sólo funcionan por la nube del fabricante y no
                exponen RTSP (varias Wyze, Ring, Nest, Arlo) no se pueden
                conectar.
              </Text>
            </li>
          </ul>

          <Text size="sm" className="mb-2">
            Rutas RTSP de fábrica por marca. Si tienes un NVR/DVR, la IP es la
            del grabador y el número de canal va en la ruta:
          </Text>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pr-4 py-1">Marca</th>
                  <th className="pr-4 py-1">Puerto</th>
                  <th className="pr-4 py-1">Ruta principal</th>
                  <th className="pr-4 py-1">Ruta secundaria</th>
                  <th className="pr-4 py-1">Modelos / notas</th>
                </tr>
              </thead>
              <tbody>
                {brands?.map((b) => (
                  <tr
                    key={b.key}
                    className="align-top border-t border-slate-200 dark:border-white/10"
                  >
                    <td className="pr-4 py-1 whitespace-nowrap">
                      <Text size="sm" font="bold">
                        {b.label}
                      </Text>
                      {b.alsoKnownAs && (
                        <Text size="sm">
                          También: {b.alsoKnownAs.join(", ")}
                        </Text>
                      )}
                    </td>
                    <td className="pr-4 py-1">
                      <Text size="sm">{b.defaultPort}</Text>
                    </td>
                    <td className="pr-4 py-1">
                      <Text size="sm">
                        <code>{b.mainPath}</code>
                      </Text>
                    </td>
                    <td className="pr-4 py-1">
                      <Text size="sm">
                        {b.subPath ? <code>{b.subPath}</code> : "—"}
                      </Text>
                    </td>
                    <td className="py-1">
                      <Text size="sm">{b.examples.join(", ")}</Text>
                      {b.notes && <Text size="sm">{b.notes}</Text>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!brands && (
            <Text size="sm">Cargando marcas compatibles…</Text>
          )}
        </div>
      )}

      {/* Mismo motivo que la tarjeta de compatibilidad: el formulario tiene
          fondo propio, así que el color de los textos sueltos (la pista de la
          marca, el enlace del stream secundario, la etiqueta del check) va
          escrito aquí para los dos temas. */}
      {canManage && showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/5 p-4 rounded-lg text-slate-700 dark:text-slate-200"
        >
          <InputField
            regexType="safeChars"
            required
            helpText="Nombre"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            placeholder="Nombre (ej. Portería)"
            className="text-black"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <InputField
            regexType="safeChars"
            helpText="Ubicación"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            placeholder="Ubicación (ej. Entrada principal)"
            className="text-black"
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
          />
          <div className="md:col-span-2">
            <SelectField
              helpText="Marca"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              className="text-black"
              options={brandOptions}
              defaultOption="Selecciona la marca"
              value={form.brand}
              onChange={(e) => handleBrandChange(e.target.value)}
            />
            {currentBrand && (
              <Text size="sm" className="mt-1">
                {currentBrand.examples.join(", ")}
                {currentBrand.notes ? ` — ${currentBrand.notes}` : ""}
              </Text>
            )}
          </div>
          <InputField
            regexType="safeChars"
            required
            helpText="IP / Host"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            placeholder="IP / Host (ej. 192.168.1.88)"
            className="text-black"
            value={form.host}
            onChange={(e) => handleChange("host", e.target.value)}
          />
          <InputField
            regexType="number"
            type="number"
            helpText="Puerto RTSP"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            placeholder="Puerto RTSP (554)"
            className="text-black"
            value={form.rtspPort}
            onChange={(e) => handleChange("rtspPort", Number(e.target.value))}
          />
          <div>
            <InputField
              helpText="Ruta RTSP"
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
              placeholder="Ruta RTSP (/videoMain)"
              className="text-black"
              value={form.rtspPath}
              onChange={(e) => handleChange("rtspPath", e.target.value)}
            />
            {currentBrand?.subPath && (
              <Buton
                type="button"
                borderWidth="none"
                className="underline mt-1"
                onClick={() =>
                  handleChange("rtspPath", currentBrand.subPath as string)
                }
              >
                Usar stream secundario (más liviano)
              </Buton>
            )}
          </div>
          <InputField
            regexType="safeChars"
            helpText="Usuario"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            placeholder="Usuario"
            className="text-black"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
          />
          <InputField
            type="password"
            helpText="Contraseña"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            placeholder="Contraseña"
            className="text-black"
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

      {isLoading && <Text colVariant="on" size="sm">Cargando cámaras…</Text>}
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
              className="underline text-white"
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
            className="bg-white/5 rounded-lg p-4 flex flex-col gap-2 text-slate-700 dark:text-slate-200"
          >
            <Title
              as="h4"
              size="sm"
              font="bold"
              className="text-slate-900 dark:text-white"
            >
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
              {canManage && (
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
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
