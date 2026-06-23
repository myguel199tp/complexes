/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  InputField,
  Modal,
  SelectField,
  Text,
} from "complexes-next-components";
import { useUpdateProfileMutation } from "../use-update-profile-mutation";
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";
import { User } from "@/app/(sets)/ensemble/service/response/ensembleResponse";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function ModalEditProfile({ isOpen, onClose, user }: Props) {
  const { mutate, isPending } = useUpdateProfileMutation();
  const { countryOptions, data: datacountry } = useCountryCityOptions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user.name ?? "",
    lastName: user.lastName ?? "",
    phone: user.phone ?? "",
    indicative: user.indicative ?? "",
    country: user.country ?? "",
    city: user.city ?? "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: user.name ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
        indicative: user.indicative ?? "",
        country: user.country ?? "",
        city: user.city ?? "",
      });
      setFile(null);
      setPreview(null);
    }
  }, [isOpen, user]);

  const cityOptions =
    datacountry
      ?.find((c) => String(c.ids) === String(form.country))
      ?.city?.map((c) => ({ value: String(c.id), label: c.name })) ?? [];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
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

        {/* Avatar preview */}
        <div className="flex items-center gap-4">
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="w-16 h-16 rounded-full object-cover border"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-100 border flex items-center justify-center text-gray-400 text-xs">
              Sin foto
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              colVariant="default"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Cambiar foto
            </Button>
            <Text size="xs" className="text-gray-400 mt-1">
              JPG, PNG o WEBP · máx 5 MB
            </Text>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField
            label="Nombre"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <InputField
            label="Apellido"
            value={form.lastName}
            onChange={(e) =>
              setForm((f) => ({ ...f, lastName: e.target.value }))
            }
            required
          />
          <InputField
            label="Indicativo"
            value={form.indicative}
            onChange={(e) =>
              setForm((f) => ({ ...f, indicative: e.target.value }))
            }
          />
          <InputField
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
