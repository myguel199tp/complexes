/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Modal,
  Text,
} from "complexes-next-components";
import { useUpdateProfileMutation } from "../use-update-profile-mutation";
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";
import { User } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import {
  countrySelectValue,
  indicativeSelectValue,
  INDICATIVE_OPTIONS,
} from "@/app/helpers/countryCity";
import { InputField, SelectField } from "@/app/components/ui/form";
import { fileUrl } from "@/app/helpers/fileUrl";

/** Lo mismo que acepta el backend en PATCH /auth/profile. */
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = /\.(jpe?g|png|webp)$/i;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function ModalEditProfile({ isOpen, onClose, user }: Props) {
  const { mutate, isPending } = useUpdateProfileMutation();
  const { countryOptions, data: datacountry } = useCountryCityOptions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // El país puede venir como código ISO ("CO") y el select trabaja con `ids`:
  // sin normalizarlo quedaba sin seleccionar y la lista de ciudades vacía.
  const [form, setForm] = useState({
    name: user.name ?? "",
    lastName: user.lastName ?? "",
    phone: user.phone ?? "",
    indicative: indicativeSelectValue(user.indicative),
    country: countrySelectValue(user.country),
    city: user.city ?? "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  /*
    Antes, sin foto nueva elegida, el recuadro decía "Sin foto" aunque el
    usuario ya tuviera una: no había con qué comparar el cambio.
  */
  const currentPhoto = fileUrl(user.file);
  const shownPhoto = preview ?? currentPhoto;

  // Cada vista previa es un blob en memoria: se libera al cambiarla o al cerrar.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: user.name ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
        indicative: indicativeSelectValue(user.indicative),
        country: countrySelectValue(user.country),
        city: user.city ?? "",
      });
      setFile(null);
      setPreview(null);
      setFileError(null);
    }
  }, [isOpen, user]);

  const cityOptions =
    datacountry
      ?.find((c) => String(c.ids) === String(form.country))
      ?.city?.map((c) => ({ value: String(c.id), label: c.name })) ?? [];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;

    // Se limpia para que volver a elegir el mismo archivo dispare `onChange`.
    e.target.value = "";

    if (!selected) return;

    // Se valida aquí para no enterarse del rechazo después de enviar todo.
    if (!PHOTO_TYPES.test(selected.name)) {
      setFileError("Solo se permiten imágenes JPG, PNG o WEBP");
      return;
    }

    if (selected.size > MAX_PHOTO_BYTES) {
      setFileError("La imagen pesa más de 5 MB");
      return;
    }

    setFileError(null);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function discardPhoto() {
    setFile(null);
    setPreview(null);
    setFileError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate(
      { ...form, file },
      {
        onSuccess: () => onClose(),
      },
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 p-2">
        <Text font="bold" size="lg">
          Editar perfil
        </Text>

        {/* FOTO: la actual, o la nueva tal como va a quedar antes de guardar. */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            aria-label="Elegir foto de perfil"
          >
            {shownPhoto ? (
              <img
                src={shownPhoto}
                alt={preview ? "Nueva foto de perfil" : "Foto de perfil actual"}
                className={`h-24 w-24 rounded-full object-cover border-2 ${
                  preview ? "border-cyan-500" : "border-gray-200"
                }`}
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-500 text-xs">
                Sin foto
              </div>
            )}

            {preview && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-cyan-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                Nueva
              </span>
            )}
          </button>

          <div className="flex flex-col items-center gap-1 sm:items-start">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                colVariant="default"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? "Elegir otra" : "Cambiar foto"}
              </Button>

              {preview && (
                <Button
                  type="button"
                  colVariant="danger"
                  size="sm"
                  onClick={discardPhoto}
                >
                  Quitar
                </Button>
              )}
            </div>

            <Text size="xs" className="text-gray-500">
              {file
                ? `${file.name} · se guarda al pulsar "Guardar cambios"`
                : "JPG, PNG o WEBP · máx 5 MB"}
            </Text>

            {fileError && (
              <Text size="xs" colVariant="danger">
                {fileError}
              </Text>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField
            regexType="safeChars"
            label="Nombre"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <InputField
            regexType="letters"
            label="Apellido"
            value={form.lastName}
            onChange={(e) =>
              setForm((f) => ({ ...f, lastName: e.target.value }))
            }
            required
          />
          <SelectField
            label="Indicativo"
            defaultOption="Indicativo"
            value={form.indicative}
            onChange={(e) =>
              setForm((f) => ({ ...f, indicative: e.target.value }))
            }
            options={INDICATIVE_OPTIONS}
          />
          <InputField
            regexType="phone"
            label="Teléfono"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <SelectField
            label="País"
            value={form.country}
            onChange={(e) =>
              setForm((f) => ({ ...f, country: e.target.value, city: "" }))
            }
            options={countryOptions ?? []}
          />
          <SelectField
            label="Ciudad"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            options={cityOptions}
            disabled={cityOptions.length === 0}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            colVariant="default"
            size="sm"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            colVariant="success"
            size="sm"
            disabled={isPending}
          >
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
