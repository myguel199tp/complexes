"use client";

import {
  Buton,
  InputField,
  SelectField,
  Text,
  Title,
} from "complexes-next-components";
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
    watch,
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
            regexType="safeChars"
            placeholder="Nombre"
            {...register("name")}
            hasError={!!errors.name}
            errorMessage={errors.name?.message}
          />
          <InputField
            regexType="letters"
            placeholder="Apellido"
            {...register("lastName")}
            hasError={!!errors.lastName}
            errorMessage={errors.lastName?.message}
          />
          <InputField
            regexType="email"
            type="email"
            placeholder="Correo"
            {...register("email")}
            hasError={!!errors.email}
            errorMessage={errors.email?.message}
          />
          <InputField
            regexType="phone"
            placeholder="Indicativo (+57)"
            {...register("indicative")}
            hasError={!!errors.indicative}
            errorMessage={errors.indicative?.message}
          />
          <InputField
            regexType="phone"
            placeholder="Teléfono"
            {...register("phone")}
            hasError={!!errors.phone}
            errorMessage={errors.phone?.message}
          />
          <InputField
            regexType="alphanumeric"
            placeholder="Cédula"
            {...register("numberId")}
            hasError={!!errors.numberId}
            errorMessage={errors.numberId?.message}
          />
          <InputField regexType="letters" placeholder="País" {...register("country")} />
          <InputField regexType="letters" placeholder="Ciudad" {...register("city")} />
          <InputField regexType="alphanumeric" placeholder="Torre" {...register("tower")} />

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
                regexType="letters"
                placeholder="Nombre completo"
                {...register(`familyInfo.${index}.nameComplet`)}
                hasError={!!errors.familyInfo?.[index]?.nameComplet}
                errorMessage={errors.familyInfo?.[index]?.nameComplet?.message}
              />
              <InputField
                regexType="letters"
                placeholder="Apellido"
                {...register(`familyInfo.${index}.lastComplet`)}
                hasError={!!errors.familyInfo?.[index]?.lastComplet}
                errorMessage={errors.familyInfo?.[index]?.lastComplet?.message}
              />
              <InputField
                regexType="email"
                type="email"
                placeholder="Correo"
                {...register(`familyInfo.${index}.email`)}
                hasError={!!errors.familyInfo?.[index]?.email}
                errorMessage={errors.familyInfo?.[index]?.email?.message}
              />
              <InputField
                regexType="phone"
                placeholder="Indicativo"
                {...register(`familyInfo.${index}.indicative`)}
              />
              <InputField
                regexType="phone"
                placeholder="Teléfono"
                {...register(`familyInfo.${index}.phones`)}
              />
              <InputField
                regexType="alphanumeric"
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
                regexType="letters"
                placeholder="País"
                {...register(`familyInfo.${index}.country`)}
              />
              <InputField
                regexType="letters"
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
                regexType="alphanumeric"
                placeholder="Placa"
                {...register(`vehicles.${index}.plaque`)}
                hasError={!!errors.vehicles?.[index]?.plaque}
                errorMessage={errors.vehicles?.[index]?.plaque?.message}
              />

              {/* SelectField no es un <select> nativo: emite
                  onChange({ target: { value } }) sin `name`, así que el valor
                  se fija con setValue en lugar de confiar en register. */}
              <SelectField
                {...register(`vehicles.${index}.type`)}
                helpText="Tipo de vehículo"
                sizeHelp="xs"
                inputSize="sm"
                rounded="md"
                defaultOption="Tipo de vehículo"
                options={[
                  { value: "carro", label: "Carro" },
                  { value: "moto", label: "Moto" },
                ]}
                value={watch(`vehicles.${index}.type`) ?? ""}
                onChange={(e) =>
                  setValue(
                    `vehicles.${index}.type`,
                    e.target.value as "carro" | "moto",
                    { shouldValidate: true },
                  )
                }
              />

              <SelectField
                {...register(`vehicles.${index}.parkingType`)}
                helpText="Tipo de parqueadero"
                sizeHelp="xs"
                inputSize="sm"
                rounded="md"
                defaultOption="Tipo de parqueadero"
                options={[
                  { value: "privado", label: "Parqueadero privado" },
                  { value: "publico", label: "Parqueadero público" },
                ]}
                value={watch(`vehicles.${index}.parkingType`) ?? ""}
                onChange={(e) =>
                  setValue(
                    `vehicles.${index}.parkingType`,
                    e.target.value as "publico" | "privado",
                    { shouldValidate: true },
                  )
                }
              />

              {/*
                Celdas del inventario. Antes era texto libre y la transferencia
                podía dejar al nuevo propietario con una celda inexistente.
              */}
              <SelectField
                {...register(`vehicles.${index}.parkingSpotId`)}
                helpText="Celda asignada"
                sizeHelp="xs"
                inputSize="sm"
                rounded="md"
                defaultOption="Sin celda asignada"
                options={parkingSpots.options}
                value={watch(`vehicles.${index}.parkingSpotId`) ?? ""}
                onChange={(e) =>
                  setValue(`vehicles.${index}.parkingSpotId`, e.target.value, {
                    shouldValidate: true,
                  })
                }
              />

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
