/* eslint-disable @next/next/no-img-element */
"use client";

import { Modal, Text, Badge, Tabs, Button } from "complexes-next-components";
import React, { useState } from "react";
import { CreateBedRoomDto } from "@/app/(dashboard)/holiday/services/response/holidayResponses";

/** 🔹 Tipo seguro para archivos */
export interface UploadedFile {
  url?: string;
  name?: string;
  type?: string;
  size?: number;
  lastModified?: number;
}

/** Props del componente (igual a como tú la definiste) */
interface Props {
  isOpen: boolean;
  onClose: () => void;

  id: string;
  iduser: string;

  property: string;
  name: string;
  bedRooms: CreateBedRoomDto[];
  maxGuests: number;

  neigborhood: string;
  city: string;
  country: string;
  address: string;
  tower: string;
  apartment: string;
  cel: string;

  amenities: string[];

  parking: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  eventsAllowed: boolean;
  residentplace: boolean;
  bartroomPrivate: boolean;
  status: boolean;
  roomingin: boolean;

  price: number;
  currency: string;
  cleaningFee: number;
  deposit: number;
  promotion: string;

  ruleshome: string;
  description: string;

  files?: (File | UploadedFile)[];

  nameUnit: string;
  unitName: string;
  conjunto_id: string;

  startDate: string;
  endDate: string;

  codigo: string;
  indicative: string;
  anfitrion: string;

  image: string;
  videoUrl: string;
  videos: string[];
}

/** Tipo para el estado del formulario: todas las props menos isOpen/onClose */
type FormState = Omit<Props, "isOpen" | "onClose">;

/** Edit tabs keys */
type EditTabKeys =
  | "general"
  | "fechas"
  | "unidades"
  | "amenidades"
  | "permisos"
  | "costos"
  | "reglas"
  | "archivos";

type EditTabState = Record<EditTabKeys, boolean>;

/** ---------- Pequeños componentes de ayuda (tipados) ---------- */

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | undefined;
}) => (
  <Text className="text-sm">
    <strong className="font-semibold">{label}: </strong>
    <span className="opacity-80">{String(value ?? "")}</span>
  </Text>
);

const TextInput = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold">{label}</label>
    <input
      className="border rounded-lg px-3 py-2"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const NumberInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold">{label}</label>
    <input
      type="number"
      className="border rounded-lg px-3 py-2"
      value={String(value ?? "")}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === "" ? 0 : Number(val));
      }}
    />
  </div>
);

const TextAreaInput = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold">{label}</label>
    <textarea
      className="border rounded-lg px-3 py-2 min-h-[120px]"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

/** ---------- Componente principal ---------- */

export default function ModalSummary({ isOpen, onClose, ...data }: Props) {
  // `data` es FormState
  const initialForm: FormState = { ...data };

  const [form, setForm] = useState<FormState>(initialForm);

  const [editTab, setEditTab] = useState<EditTabState>({
    general: false,
    fechas: false,
    unidades: false,
    amenidades: false,
    permisos: false,
    costos: false,
    reglas: false,
    archivos: false,
  });

  /** updateField con tipado estricto */
  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /** Función para guardar — aquí podrías llamar tu API */
  const handleSaveSection = (key: EditTabKeys) => {
    setEditTab((prev) => ({ ...prev, [key]: false }));
    // TODO: integrar petición al backend (PATCH/PUT)
    console.log(`Guardar sección ${key}`, form);
  };

  /** Permisos list (clave en FormState es boolean) */
  const permissionFields: Array<[keyof FormState, string]> = [
    ["parking", "Parqueadero"],
    ["petsAllowed", "Mascotas"],
    ["smokingAllowed", "Fumar permitido"],
    ["eventsAllowed", "Eventos"],
    ["residentplace", "Residente"],
    ["bartroomPrivate", "Baño privado"],
    ["status", "Estado"],
    ["roomingin", "Rooming in"],
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resumen de la propiedad"
      className="w-[1400px]"
    >
      <Tabs
        defaultActiveIndex={0}
        tabs={[
          // -----------------------------------------
          // 🏠 Información general
          // -----------------------------------------
          {
            tKey: "🏠 Información general",
            children: (
              <div className="p-4 space-y-4">
                <div className="flex justify-end">
                  {!editTab.general ? (
                    <Button
                      onClick={() => setEditTab({ ...editTab, general: true })}
                    >
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        className="bg-gray-300"
                        onClick={() =>
                          setEditTab({ ...editTab, general: false })
                        }
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="bg-green-600"
                        onClick={() => handleSaveSection("general")}
                      >
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {!editTab.general ? (
                    <>
                      <InfoRow label="Nombre" value={form.name} />
                      <InfoRow label="Propiedad" value={form.property} />
                      <InfoRow label="Ciudad" value={form.city} />
                      <InfoRow label="País" value={form.country} />
                      <InfoRow label="Barrio" value={form.neigborhood} />
                      <InfoRow label="Dirección" value={form.address} />
                      <InfoRow label="Torre" value={form.tower} />
                      <InfoRow label="Apartamento" value={form.apartment} />
                      <InfoRow label="Código" value={form.codigo} />
                      <InfoRow label="Indicativo" value={form.indicative} />
                      <InfoRow label="Anfitrión" value={form.anfitrion} />
                      <InfoRow label="Celular" value={form.cel} />
                    </>
                  ) : (
                    <>
                      <TextInput
                        label="Nombre"
                        value={form.name}
                        onChange={(v) => updateField("name", v)}
                      />
                      <TextInput
                        label="Propiedad"
                        value={form.property}
                        onChange={(v) => updateField("property", v)}
                      />
                      <TextInput
                        label="Ciudad"
                        value={form.city}
                        onChange={(v) => updateField("city", v)}
                      />
                      <TextInput
                        label="País"
                        value={form.country}
                        onChange={(v) => updateField("country", v)}
                      />
                      <TextInput
                        label="Barrio"
                        value={form.neigborhood}
                        onChange={(v) => updateField("neigborhood", v)}
                      />
                      <TextInput
                        label="Dirección"
                        value={form.address}
                        onChange={(v) => updateField("address", v)}
                      />
                      <TextInput
                        label="Torre"
                        value={form.tower}
                        onChange={(v) => updateField("tower", v)}
                      />
                      <TextInput
                        label="Apartamento"
                        value={form.apartment}
                        onChange={(v) => updateField("apartment", v)}
                      />
                      <TextInput
                        label="Código"
                        value={form.codigo}
                        onChange={(v) => updateField("codigo", v)}
                      />
                      <TextInput
                        label="Indicativo"
                        value={form.indicative}
                        onChange={(v) => updateField("indicative", v)}
                      />
                      <TextInput
                        label="Anfitrión"
                        value={form.anfitrion}
                        onChange={(v) => updateField("anfitrion", v)}
                      />
                      <TextInput
                        label="Celular"
                        value={form.cel}
                        onChange={(v) => updateField("cel", v)}
                      />
                    </>
                  )}
                </div>
              </div>
            ),
          },

          // -----------------------------------------
          // 📅 Fechas
          // -----------------------------------------
          {
            tKey: "📅 Fechas",
            children: (
              <div className="p-4 space-y-4">
                <div className="flex justify-end">
                  {!editTab.fechas ? (
                    <Button
                      onClick={() => setEditTab({ ...editTab, fechas: true })}
                    >
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        className="bg-gray-300"
                        onClick={() =>
                          setEditTab({ ...editTab, fechas: false })
                        }
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="bg-green-600"
                        onClick={() => handleSaveSection("fechas")}
                      >
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>

                {!editTab.fechas ? (
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Inicio" value={form.startDate} />
                    <InfoRow label="Fin" value={form.endDate} />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <TextInput
                      label="Inicio"
                      value={form.startDate}
                      onChange={(v) => updateField("startDate", v)}
                    />
                    <TextInput
                      label="Fin"
                      value={form.endDate}
                      onChange={(v) => updateField("endDate", v)}
                    />
                  </div>
                )}
              </div>
            ),
          },

          // -----------------------------------------
          // 🏢 Unidades
          // -----------------------------------------
          {
            tKey: "🏢 Unidades",
            children: (
              <div className="p-4 space-y-4">
                <div className="flex justify-end">
                  {!editTab.unidades ? (
                    <Button
                      onClick={() => setEditTab({ ...editTab, unidades: true })}
                    >
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        className="bg-gray-300"
                        onClick={() =>
                          setEditTab({ ...editTab, unidades: false })
                        }
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="bg-green-600"
                        onClick={() => handleSaveSection("unidades")}
                      >
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>

                {!editTab.unidades ? (
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Nombre unidad" value={form.nameUnit} />
                    <InfoRow label="Unidad" value={form.unitName} />
                    <InfoRow label="Conjunto ID" value={form.conjunto_id} />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <TextInput
                      label="Nombre unidad"
                      value={form.nameUnit}
                      onChange={(v) => updateField("nameUnit", v)}
                    />
                    <TextInput
                      label="Unidad"
                      value={form.unitName}
                      onChange={(v) => updateField("unitName", v)}
                    />
                    <TextInput
                      label="Conjunto ID"
                      value={form.conjunto_id}
                      onChange={(v) => updateField("conjunto_id", v)}
                    />
                  </div>
                )}
              </div>
            ),
          },

          // -----------------------------------------
          // ✨ Amenidades
          // -----------------------------------------
          {
            tKey: "✨ Amenidades",
            children: (
              <div className="p-4 space-y-4">
                <div className="flex justify-end">
                  {!editTab.amenidades ? (
                    <Button
                      onClick={() =>
                        setEditTab({ ...editTab, amenidades: true })
                      }
                    >
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        className="bg-gray-300"
                        onClick={() =>
                          setEditTab({ ...editTab, amenidades: false })
                        }
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="bg-green-600"
                        onClick={() => handleSaveSection("amenidades")}
                      >
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>

                {!editTab.amenidades ? (
                  <div className="flex flex-wrap gap-2">
                    {form.amenities?.length ? (
                      form.amenities.map((a, i) => (
                        <Badge key={i} className="px-4 py-1 rounded-full">
                          {a}
                        </Badge>
                      ))
                    ) : (
                      <Text>Sin amenidades</Text>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {form.amenities.map((a, i) => (
                      <TextInput
                        key={i}
                        label={`Amenidad ${i + 1}`}
                        value={a}
                        onChange={(v) => {
                          const updated = [...form.amenities];
                          updated[i] = v;
                          updateField("amenities", updated);
                        }}
                      />
                    ))}

                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          updateField("amenities", [...form.amenities, ""])
                        }
                      >
                        + Agregar amenidad
                      </Button>
                      <Button
                        className="bg-red-500"
                        onClick={() =>
                          updateField(
                            "amenities",
                            form.amenities.slice(
                              0,
                              Math.max(0, form.amenities.length - 1)
                            )
                          )
                        }
                      >
                        - Quitar última
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ),
          },

          // -----------------------------------------
          // ⚙️ Permisos
          // -----------------------------------------
          {
            tKey: "⚙️ Permisos",
            children: (
              <div className="p-4 space-y-4">
                <div className="flex justify-end">
                  {!editTab.permisos ? (
                    <Button
                      onClick={() => setEditTab({ ...editTab, permisos: true })}
                    >
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        className="bg-gray-300"
                        onClick={() =>
                          setEditTab({ ...editTab, permisos: false })
                        }
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="bg-green-600"
                        onClick={() => handleSaveSection("permisos")}
                      >
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {permissionFields.map(([key, label]) => {
                    const value = Boolean(
                      form[key as keyof FormState] as unknown as boolean
                    );
                    return (
                      <div
                        key={String(key)}
                        className="flex items-center justify-between"
                      >
                        <Text className="font-semibold">{label}</Text>
                        {!editTab.permisos ? (
                          <Text>{value ? "Sí" : "No"}</Text>
                        ) : (
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) =>
                              updateField(
                                key as keyof FormState,
                                e.target.checked as FormState[typeof key]
                              )
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
          },

          // -----------------------------------------
          // 💰 Costos
          // -----------------------------------------
          {
            tKey: "💰 Costos",
            children: (
              <div className="p-4 space-y-4">
                <div className="flex justify-end">
                  {!editTab.costos ? (
                    <Button
                      onClick={() => setEditTab({ ...editTab, costos: true })}
                    >
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        className="bg-gray-300"
                        onClick={() =>
                          setEditTab({ ...editTab, costos: false })
                        }
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="bg-green-600"
                        onClick={() => handleSaveSection("costos")}
                      >
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>

                {!editTab.costos ? (
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow
                      label="Precio"
                      value={`${form.price} ${form.currency}`}
                    />
                    <InfoRow label="Limpieza" value={form.cleaningFee} />
                    <InfoRow label="Depósito" value={form.deposit} />
                    <InfoRow
                      label="Promoción"
                      value={form.promotion || "Ninguna"}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput
                      label="Precio"
                      value={form.price}
                      onChange={(v) => updateField("price", v)}
                    />
                    <TextInput
                      label="Moneda"
                      value={form.currency}
                      onChange={(v) => updateField("currency", v)}
                    />
                    <NumberInput
                      label="Limpieza"
                      value={form.cleaningFee}
                      onChange={(v) => updateField("cleaningFee", v)}
                    />
                    <NumberInput
                      label="Depósito"
                      value={form.deposit}
                      onChange={(v) => updateField("deposit", v)}
                    />
                    <TextInput
                      label="Promoción"
                      value={form.promotion}
                      onChange={(v) => updateField("promotion", v)}
                    />
                  </div>
                )}
              </div>
            ),
          },

          // -----------------------------------------
          // 📋 Reglas y descripción
          // -----------------------------------------
          {
            tKey: "📋 Reglas y descripción",
            children: (
              <div className="p-4 space-y-4">
                <div className="flex justify-end">
                  {!editTab.reglas ? (
                    <Button
                      onClick={() => setEditTab({ ...editTab, reglas: true })}
                    >
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        className="bg-gray-300"
                        onClick={() =>
                          setEditTab({ ...editTab, reglas: false })
                        }
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="bg-green-600"
                        onClick={() => handleSaveSection("reglas")}
                      >
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>

                {!editTab.reglas ? (
                  <div className="space-y-3">
                    <InfoRow
                      label="Reglas"
                      value={form.ruleshome || "Sin reglas"}
                    />
                    <InfoRow
                      label="Descripción"
                      value={form.description || "Sin descripción"}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <TextAreaInput
                      label="Reglas"
                      value={form.ruleshome}
                      onChange={(v) => updateField("ruleshome", v)}
                    />
                    <TextAreaInput
                      label="Descripción"
                      value={form.description}
                      onChange={(v) => updateField("description", v)}
                    />
                  </div>
                )}
              </div>
            ),
          },

          // -----------------------------------------
          // 🖼️ Archivos
          // -----------------------------------------
          {
            tKey: "🖼️ Archivos",
            children: (
              <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="flex justify-end">
                  {!editTab.archivos ? (
                    <Button
                      onClick={() => setEditTab({ ...editTab, archivos: true })}
                    >
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        className="bg-gray-300"
                        onClick={() =>
                          setEditTab({ ...editTab, archivos: false })
                        }
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="bg-green-600"
                        onClick={() => handleSaveSection("archivos")}
                      >
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>

                {!editTab.archivos ? (
                  <>
                    {form.files?.length ? (
                      <section>
                        <div className="grid grid-cols-3 gap-3">
                          {form.files.map((file, i) => {
                            const url =
                              file instanceof File
                                ? URL.createObjectURL(file)
                                : file.url ?? "";
                            return (
                              <img
                                key={i}
                                src={url}
                                alt={
                                  file instanceof File
                                    ? file.name
                                    : file.name ?? `Archivo ${i}`
                                }
                                className="w-full h-40 object-cover rounded-xl border shadow-sm"
                              />
                            );
                          })}
                        </div>
                      </section>
                    ) : (
                      <Text>Sin imágenes</Text>
                    )}

                    {form.videoUrl && (
                      <section>
                        <Text className="font-semibold mb-2">🎥 Video</Text>
                        <video controls className="w-full rounded-xl shadow-md">
                          <source src={form.videoUrl} type="video/mp4" />
                        </video>
                      </section>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold">
                        Subir imágenes
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(
                            e.target.files ?? []
                          ) as File[];
                          updateField("files", files);
                        }}
                      />
                    </div>

                    <TextInput
                      label="Video URL"
                      value={form.videoUrl}
                      onChange={(v) => updateField("videoUrl", v)}
                    />
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
}
