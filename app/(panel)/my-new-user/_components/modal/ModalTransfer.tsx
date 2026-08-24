"use client";

import { Buton, InputField, Text, Title } from "complexes-next-components";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useTransferForm } from "./use-transfer-form";
import { useAvailableSpots } from "@/app/(panel)/my-parking/services/useAvailableSpots";
import { Controller } from "react-hook-form";
import DateField from "@/app/components/ui/date-field/DateField";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: EnsembleResponse | null;
}

export default function ModalTransfer({ isOpen, onClose, selectedUser }: Props) {
  const { conjuntoId } = useConjuntoStore();

  // Celdas libres del inventario para el selector de parqueadero.
  const parkingSpots = useAvailableSpots();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    family,
    vehicles,
    isLoading,
  } = useTransferForm({
    oldOwnerId: selectedUser?.user?.id,
    conjuntoId: conjuntoId ?? "",
    apartment: selectedUser?.apartment ?? "",
    onSuccess: onClose,
  });

  if (!isOpen) return null;

  const currentOwner = `${selectedUser?.user?.name ?? ""} ${
    selectedUser?.user?.lastName ?? ""
  }`.trim();

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center overflow-y-auto z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl w-[700px] space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div>
          <Text as="h2" size="md" font="bold">Transferir propiedad</Text>

          <Text size="sm" className="text-gray-600 mt-1">
            El apartamento{" "}
            <strong>
              {selectedUser?.tower ? `${selectedUser.tower} - ` : ""}
              {selectedUser?.apartment || "—"}
            </strong>{" "}
            dejará de pertenecer a <strong>{currentOwner || "—"}</strong>. Su
            registro y el de sus familiares quedan desactivados, no se eliminan.
          </Text>
        </div>

        {/* 🔥 OWNER */}
        <div className="space-y-3">
          <Title as="h3" size="xs" font="semi">Nuevo propietario</Title>

          <InputField
            placeholder="Nombre"
            {...register("name")}
            hasError={!!errors.name}
            errorMessage={errors.name?.message}
          />
          <InputField
            placeholder="Apellido"
            {...register("lastName")}
            hasError={!!errors.lastName}
            errorMessage={errors.lastName?.message}
          />
          <InputField
            type="email"
            placeholder="Correo"
            {...register("email")}
            hasError={!!errors.email}
            errorMessage={errors.email?.message}
          />
          <InputField
            placeholder="Indicativo (+57)"
            {...register("indicative")}
            hasError={!!errors.indicative}
            errorMessage={errors.indicative?.message}
          />
          <InputField
            placeholder="Teléfono"
            {...register("phone")}
            hasError={!!errors.phone}
            errorMessage={errors.phone?.message}
          />
          <InputField
            placeholder="Cédula"
            {...register("numberId")}
            hasError={!!errors.numberId}
            errorMessage={errors.numberId?.message}
          />
          <InputField placeholder="País" {...register("country")} />
          <InputField placeholder="Ciudad" {...register("city")} />
          <InputField placeholder="Torre" {...register("tower")} />

          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) =>
              setValue("file", e.target.files?.[0] ?? null, {
                shouldValidate: true,
              })
            }
          />
        </div>

        {/* 🔥 FAMILIARES */}
        <div className="space-y-3">
          <Title as="h3" size="xs" font="semi">Familiares</Title>

          {family.fields.map((field, index) => (
            <div key={field.id} className="border p-3 rounded-lg space-y-2">
              <InputField
                placeholder="Nombre completo"
                {...register(`familyInfo.${index}.nameComplet`)}
                hasError={!!errors.familyInfo?.[index]?.nameComplet}
                errorMessage={errors.familyInfo?.[index]?.nameComplet?.message}
              />
              <InputField
                placeholder="Apellido"
                {...register(`familyInfo.${index}.lastComplet`)}
                hasError={!!errors.familyInfo?.[index]?.lastComplet}
                errorMessage={errors.familyInfo?.[index]?.lastComplet?.message}
              />
              <InputField
                type="email"
                placeholder="Correo"
                {...register(`familyInfo.${index}.email`)}
                hasError={!!errors.familyInfo?.[index]?.email}
                errorMessage={errors.familyInfo?.[index]?.email?.message}
              />
              <InputField
                placeholder="Indicativo"
                {...register(`familyInfo.${index}.indicative`)}
              />
              <InputField
                placeholder="Teléfono"
                {...register(`familyInfo.${index}.phones`)}
              />
              <InputField
                placeholder="Cédula"
                {...register(`familyInfo.${index}.numberId`)}
              />
              <Controller
                name={`familyInfo.${index}.dateBorn`}
                control={control}
                render={({ field }) => (
                  <DateField
                    label="Fecha nacimiento"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                )}
              />
              <InputField
                placeholder="País"
                {...register(`familyInfo.${index}.country`)}
              />
              <InputField
                placeholder="Ciudad"
                {...register(`familyInfo.${index}.city`)}
              />

              <Buton
                type="button"
                size="sm"
                colVariant="danger"
                onClick={() => family.remove(index)}
              >
                Quitar familiar
              </Buton>
            </div>
          ))}

          <Buton
            type="button"
            onClick={() =>
              family.append({
                nameComplet: "",
                lastComplet: "",
                email: "",
                indicative: "",
                phones: "",
                numberId: "",
                dateBorn: null,
                country: "",
                city: "",
              })
            }
          >
            + Agregar familiar
          </Buton>
        </div>

        {/* 🔥 VEHÍCULOS */}
        <div className="space-y-3">
          <Title as="h3" size="xs" font="semi">Vehículos</Title>

          {vehicles.fields.map((field, index) => (
            <div key={field.id} className="border p-3 rounded-lg space-y-2">
              <InputField
                placeholder="Placa"
                {...register(`vehicles.${index}.plaque`)}
                hasError={!!errors.vehicles?.[index]?.plaque}
                errorMessage={errors.vehicles?.[index]?.plaque?.message}
              />

              <select
                className="border rounded-md px-3 py-2 w-full"
                {...register(`vehicles.${index}.type`)}
              >
                <option value="carro">Carro</option>
                <option value="moto">Moto</option>
              </select>

              <select
                className="border rounded-md px-3 py-2 w-full"
                {...register(`vehicles.${index}.parkingType`)}
              >
                <option value="privado">Parqueadero privado</option>
                <option value="publico">Parqueadero público</option>
              </select>

              {/*
                Celdas del inventario. Antes era texto libre y la transferencia
                podía dejar al nuevo propietario con una celda inexistente.
              */}
              <select
                className="border rounded-md p-2 text-sm"
                {...register(`vehicles.${index}.parkingSpotId`)}
              >
                <option value="">Sin celda asignada</option>
                {parkingSpots.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <Buton
                type="button"
                size="sm"
                colVariant="danger"
                onClick={() => vehicles.remove(index)}
              >
                Quitar vehículo
              </Buton>
            </div>
          ))}

          <Buton
            type="button"
            onClick={() =>
              vehicles.append({
                plaque: "",
                type: "carro",
                parkingType: "privado",
                parkingSpotId: "",
              })
            }
          >
            + Agregar vehículo
          </Buton>
        </div>

        {/* 🔥 BOTONES */}
        <div className="flex justify-end gap-3">
          <Buton type="button" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Buton>
          <Buton type="submit" disabled={isLoading}>
            {isLoading ? "Transfiriendo..." : "Transferir"}
          </Buton>
        </div>
      </form>
    </div>
  );
}
