/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Modal,
  Text,
  Badge,
  Tabs,
  Buton,
} from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import RegisterOptions from "./register-option";
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";
import { indicativeSelectValue } from "@/app/helpers/countryCity";
import { CreateBedRoomDto } from "@/app/(panel)/holiday/services/response/holidayResponses";
import { InputField, SelectField } from "@/app/components/ui/form";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { fileUrl } from "@/app/helpers/fileUrl";
import {
  HollidaySection,
  updateHollidayFiles,
  updateHollidaySection,
} from "../../../../services/hollidayManageService";

type CancellationPolicyCode = "flexible" | "moderate" | "strict";

/** Las mismas reglas que `cancellation-policy.ts` del backend. */
const CANCELLATION_POLICIES: Record<
  CancellationPolicyCode,
  { label: string; description: string }
> = {
  flexible: {
    label: "Flexible",
    description: "reembolso total hasta un día antes",
  },
  moderate: {
    label: "Moderada",
    description: "total hasta 5 días antes; 50 % entre 4 y 1 día",
  },
  strict: {
    label: "Estricta",
    description: "total hasta 14 días; 50 % entre 13 y 7; después nada",
  },
};

export interface UploadedFile {
  url?: string;
  name?: string;
  type?: string;
  size?: number;
  lastModified?: number;
}

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
  cancellationPolicy?: CancellationPolicyCode;

  ruleshome: string;
  description: string;

  /** El backend guarda rutas; los `File` son los que se acaban de elegir. */
  files?: (string | File | UploadedFile)[];

  nameUnit: string;
  unitName: string;
  conjuntoId: string;

  startDate: string;
  endDate: string;

  codigo: string;
  indicative: string;
  anfitrion: string;

  image: string;
  videoUrl: string;
  videos: string[];

  /** Recarga la tabla después de guardar. */
  onSaved?: () => void;
}

type FormState = Omit<Props, "isOpen" | "onClose" | "onSaved">;

type EditTabKeys = HollidaySection | "archivos";

type EditTabState = Record<EditTabKeys, boolean>;

const CLOSED_TABS: EditTabState = {
  general: false,
  fechas: false,
  unidades: false,
  amenidades: false,
  permisos: false,
  costos: false,
  reglas: false,
  archivos: false,
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | undefined;
}) => (
  <Text size="sm">
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
  <div className="flex flex-col mt-2 ml-2 gap-2">
    <InputField
      regexType="safeChars"
      helpText={label}
      inputSize="sm"
      value={value ?? ""}
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
  value: number | string;
  onChange: (v: number) => void;
}) => (
  <div className="flex flex-col gap-1">
    <InputField
      regexType="number"
      placeholder={label}
      helpText={label}
      inputSize="sm"
      type="number"
      value={String(value ?? "")}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === "" ? 0 : Number(val));
      }}
    />
  </div>
);

const DateInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <label className="flex flex-col gap-1 text-sm font-semibold">
    {label}
    <input
      type="date"
      className="ui-native"
      value={(value ?? "").slice(0, 10)}
      onChange={(e) => onChange(e.target.value)}
    />
  </label>
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
      className="ui-native min-h-[120px]"
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

/** Editar, o Cancelar/Guardar mientras se edita. */
const SectionHeader = ({
  editing,
  saving,
  onEdit,
  onCancel,
  onSave,
}: {
  editing: boolean;
  saving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}) => (
  <div className="flex justify-end">
    {!editing ? (
      <Buton size="sm" colVariant="primary" borderWidth="none" onClick={onEdit}>
        Editar
      </Buton>
    ) : (
      <div className="flex gap-2">
        <Buton
          size="sm"
          borderWidth="none"
          colVariant="none"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </Buton>
        <Buton
          size="sm"
          borderWidth="none"
          colVariant="success"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar"}
        </Buton>
      </div>
    )}
  </div>
);

const filePreviewUrl = (file: string | File | UploadedFile): string => {
  if (typeof file === "string") {
    return /^https?:\/\//.test(file) ? file : fileUrl(file);
  }
  if (file instanceof File) return URL.createObjectURL(file);
  return file.url ?? "";
};

export default function ModalSummary({
  isOpen,
  onClose,
  onSaved,
  ...data
}: Props) {
  const { amenitiesOptions } = RegisterOptions();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  // `saved` es lo último que confirmó el backend: Cancelar vuelve a ello.
  const [saved, setSaved] = useState<FormState>({ ...data });
  const [form, setForm] = useState<FormState>({ ...data });
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [editTab, setEditTab] = useState<EditTabState>(CLOSED_TABS);
  const [error, setError] = useState<string | null>(null);

  // El modal se reutiliza para cada fila de la tabla: al cambiar de inmueble
  // se descarta lo que hubiera del anterior.
  useEffect(() => {
    setSaved({ ...data });
    setForm({ ...data });
    setNewFiles([]);
    setEditTab(CLOSED_TABS);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.id]);

  const {
    countryOptions,
    indicativeOptions,
    data: datacountry,
  } = useCountryCityOptions();

  const countryUser =
    countryOptions.find((c) => c.value === String(form.country))?.label ||
    form.country;

  const cityUser =
    datacountry
      ?.find((c) => String(c.ids) === String(form.country))
      ?.city?.find((c) => String(c.id) === String(form.city))?.name ||
    form?.city;

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /** Lo que manda cada sección: solo columnas que el backend deja editar. */
  const sectionPayload = (key: HollidaySection): Record<string, unknown> => {
    switch (key) {
      case "general":
        return {
          name: form.name,
          property: form.property,
          neigborhood: form.neigborhood,
          address: form.address,
          anfitrion: form.anfitrion,
          cel: form.cel,
          indicative: form.indicative,
        };
      case "fechas":
        return { startDate: form.startDate, endDate: form.endDate };
      case "unidades":
        return { maxGuests: form.maxGuests };
      case "amenidades":
        return { amenities: form.amenities ?? [] };
      case "permisos":
        return {
          parking: form.parking,
          petsAllowed: form.petsAllowed,
          smokingAllowed: form.smokingAllowed,
          eventsAllowed: form.eventsAllowed,
          residentplace: form.residentplace,
          bartroomPrivate: form.bartroomPrivate,
          roomingin: form.roomingin,
        };
      case "costos":
        return {
          price: form.price,
          currency: form.currency,
          cleaningFee: form.cleaningFee,
          deposit: form.deposit,
          promotion: form.promotion,
          cancellationPolicy: form.cancellationPolicy ?? "moderate",
        };
      case "reglas":
        return { ruleshome: form.ruleshome, description: form.description };
    }
  };

  const save = useMutation({
    mutationFn: async (key: EditTabKeys) => {
      if (key === "archivos") {
        const keep = (form.files ?? []).filter(
          (f): f is string => typeof f === "string",
        );
        return updateHollidayFiles(conjuntoId, data.id, {
          keep,
          files: newFiles,
          videos: form.videos ?? [],
          videoUrl: form.videoUrl ?? "",
        });
      }
      return updateHollidaySection(conjuntoId, data.id, key, sectionPayload(key));
    },
    onSuccess: (updated, key) => {
      const next = {
        ...form,
        ...(key === "archivos" && updated?.files ? { files: updated.files } : {}),
      };
      setSaved(next);
      setForm(next);
      setNewFiles([]);
      setEditTab((prev) => ({ ...prev, [key]: false }));
      setError(null);
      onSaved?.();
    },
    onError: (e) =>
      setError(e instanceof Error ? e.message : "No se pudieron guardar los cambios"),
  });

  const startEdit = (key: EditTabKeys) =>
    setEditTab((prev) => ({ ...prev, [key]: true }));

  const cancelSection = (key: EditTabKeys) => {
    setForm(saved);
    setNewFiles([]);
    setError(null);
    setEditTab((prev) => ({ ...prev, [key]: false }));
  };

  const header = (key: EditTabKeys) => (
    <SectionHeader
      editing={editTab[key]}
      saving={save.isPending && save.variables === key}
      onEdit={() => startEdit(key)}
      onCancel={() => cancelSection(key)}
      onSave={() => save.mutate(key)}
    />
  );

  const permissionFields: Array<[keyof FormState, string]> = [
    ["parking", "Parqueadero"],
    ["petsAllowed", "Mascotas"],
    ["smokingAllowed", "Fumar permitido"],
    ["eventsAllowed", "Eventos"],
    ["residentplace", "Residente"],
    ["bartroomPrivate", "Baño privado"],
    ["roomingin", "Rooming in"],
  ];

  const amenityLabel = (value: string) =>
    amenitiesOptions.find((opt) => opt.value === value)?.label ?? value;

  const toggleAmenity = (value: string) => {
    const current = form.amenities ?? [];
    updateField(
      "amenities",
      current.includes(value)
        ? current.filter((a) => a !== value)
        : [...current, value],
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resumen de la propiedad"
      className="!w-[94%] md:!w-[520px] max-w-[96vw] max-h-[88vh] overflow-y-auto"
    >
      {error && (
        <Text size="sm" className="mb-2 rounded-md bg-red-50 p-2 text-red-700">
          {error}
        </Text>
      )}

      <Tabs
        defaultActiveIndex={0}
        tabs={[
          {
            tKey: "🏠 Información general",
            children: (
              <div className="border-2 rounded-md border-gray-100 shadow-md p-2">
                {header("general")}

                <div className="grid grid-cols-1 sm:grid-cols-2">
                  {!editTab.general ? (
                    <>
                      <InfoRow label="Nombre" value={form.name} />
                      <InfoRow label="Propiedad" value={form.property} />
                      <InfoRow label="Ciudad" value={cityUser} />
                      <InfoRow label="País" value={countryUser} />
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
                        label="Barrio"
                        value={form.neigborhood}
                        onChange={(v) => updateField("neigborhood", v)}
                      />
                      <TextInput
                        label="Dirección"
                        value={form.address}
                        onChange={(v) => updateField("address", v)}
                      />
                      <div className="flex flex-col mt-2 ml-2 gap-2">
                        <SelectField
                          helpText="Indicativo"
                          defaultOption="Indicativo"
                          inputSize="sm"
                          options={indicativeOptions}
                          value={indicativeSelectValue(form.indicative)}
                          onChange={(e) =>
                            updateField("indicative", e.target.value)
                          }
                        />
                      </div>
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
                      <Text size="xs" className="mt-2 ml-2 text-gray-500 sm:col-span-2">
                        Ciudad, país, torre, apartamento y código no se cambian
                        aquí: de ellos dependen el RNT, el mapa y el acceso de
                        portería de tus huéspedes.
                      </Text>
                    </>
                  )}
                </div>
              </div>
            ),
          },
          {
            tKey: "📅 Fechas",
            children: (
              <div className="border-2 rounded-md border-gray-100 shadow-md p-2">
                {header("fechas")}

                {!editTab.fechas ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoRow label="Inicio" value={form.startDate} />
                    <InfoRow label="Fin" value={form.endDate} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DateInput
                      label="Inicio"
                      value={form.startDate}
                      onChange={(v) => updateField("startDate", v)}
                    />
                    <DateInput
                      label="Fin"
                      value={form.endDate}
                      onChange={(v) => updateField("endDate", v)}
                    />
                    <Text size="xs" className="text-gray-500 sm:col-span-2">
                      Recibes reservas entre esas dos fechas. No puedes dejar
                      por fuera una reserva vigente.
                    </Text>
                  </div>
                )}
              </div>
            ),
          },
          {
            tKey: "🏢 Unidad",
            children: (
              <div className="border-2 rounded-md border-gray-100 shadow-md p-2">
                {header("unidades")}

                {!editTab.unidades ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoRow label="Nombre unidad" value={form.nameUnit} />
                    <InfoRow label="Unidad" value={form.unitName} />
                    <InfoRow label="Huéspedes máximo" value={form.maxGuests} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NumberInput
                      label="Huéspedes máximo"
                      value={form.maxGuests}
                      onChange={(v) => updateField("maxGuests", v)}
                    />
                  </div>
                )}
              </div>
            ),
          },
          {
            tKey: "✨ Amenidades",
            children: (
              <div className="border-2 rounded-md border-gray-100 shadow-md p-2">
                {header("amenidades")}

                {!editTab.amenidades ? (
                  <div className="flex flex-wrap gap-2">
                    {form.amenities?.length ? (
                      form.amenities.map((a, i) => (
                        <Badge
                          size="sm"
                          key={i}
                          className="px-4 py-1 rounded-full"
                        >
                          {amenityLabel(a)}
                        </Badge>
                      ))
                    ) : (
                      <Text>Sin amenidades</Text>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {amenitiesOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={(form.amenities ?? []).includes(opt.value)}
                          onChange={() => toggleAmenity(opt.value)}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
          {
            tKey: "⚙️ Permisos",
            children: (
              <div className="border-2 rounded-md border-gray-100 shadow-md p-2">
                {header("permisos")}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {permissionFields.map(([key, label]) => {
                    const value = Boolean(form[key]);
                    return (
                      <div
                        key={String(key)}
                        className="flex items-center justify-between"
                      >
                        <Text size="sm" font="semi">
                          {label}
                        </Text>
                        {!editTab.permisos ? (
                          <Badge size="sm">{value ? "Sí" : "No"}</Badge>
                        ) : (
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) =>
                              updateField(
                                key as keyof FormState,
                                e.target.checked as FormState[typeof key],
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
          {
            tKey: "💰 Costos",
            children: (
              <div className="border-2 rounded-md border-gray-100 shadow-md p-2">
                {header("costos")}

                {!editTab.costos ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoRow
                      label="Precio"
                      value={`${form.price} ${form.currency ?? ""}`}
                    />
                    <InfoRow label="Limpieza" value={form.cleaningFee} />
                    <InfoRow label="Depósito" value={form.deposit} />
                    <InfoRow
                      label="Promoción"
                      value={form.promotion ? `${form.promotion}%` : "Ninguna"}
                    />
                    <InfoRow
                      label="Cancelación"
                      value={
                        CANCELLATION_POLICIES[form.cancellationPolicy ?? "moderate"]
                          .label
                      }
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NumberInput
                      label="Precio por noche"
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
                    <NumberInput
                      label="Promoción (%)"
                      value={form.promotion ?? ""}
                      onChange={(v) => updateField("promotion", String(v))}
                    />
                    <label className="flex flex-col gap-1 text-sm font-semibold sm:col-span-2">
                      Política de cancelación
                      <select
                        className="ui-native"
                        value={form.cancellationPolicy ?? "moderate"}
                        onChange={(e) =>
                          updateField(
                            "cancellationPolicy",
                            e.target.value as CancellationPolicyCode,
                          )
                        }
                      >
                        {Object.entries(CANCELLATION_POLICIES).map(
                          ([code, policy]) => (
                            <option key={code} value={code}>
                              {policy.label}: {policy.description}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                    <Text size="xs" className="text-gray-500 sm:col-span-2">
                      Los cambios valen para las reservas nuevas; las ya
                      hechas conservan su total y su política de cancelación.
                    </Text>
                  </div>
                )}
              </div>
            ),
          },
          {
            tKey: "📋 Reglas y descripción",
            children: (
              <div className="border-2 rounded-md border-gray-100 shadow-md p-2">
                {header("reglas")}

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
          {
            tKey: "🖼️ Archivos",
            children: (
              <div className="border-2 rounded-md border-gray-100 shadow-md p-2">
                {header("archivos")}

                {form.files?.length || newFiles.length ? (
                  <section>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[...(form.files ?? []), ...newFiles].map((file, i) => (
                        <div key={i} className="relative">
                          <img
                            src={filePreviewUrl(file)}
                            alt={`Foto ${i + 1}`}
                            className="w-full h-40 object-cover rounded-xl border shadow-sm"
                          />
                          {editTab.archivos && typeof file === "string" && (
                            <button
                              type="button"
                              onClick={() =>
                                updateField(
                                  "files",
                                  (form.files ?? []).filter((f) => f !== file),
                                )
                              }
                              className="absolute right-1 top-1 rounded-full bg-white/90 px-2 text-xs font-bold text-red-600 shadow"
                              aria-label="Quitar foto"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
                  <Text>Sin imágenes</Text>
                )}

                {!editTab.archivos ? (
                  form.videoUrl && (
                    <section className="mt-3">
                      <Text className="font-semibold mb-2">🎥 Video</Text>
                      <video controls className="w-full rounded-xl shadow-md">
                        <source src={form.videoUrl} type="video/mp4" />
                      </video>
                    </section>
                  )
                ) : (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-sm font-semibold">
                        Agregar imágenes (JPG o PNG)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png"
                        onChange={(e) =>
                          setNewFiles(Array.from(e.target.files ?? []))
                        }
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
