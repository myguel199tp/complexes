"use client";

import { Button, InputField, Text } from "complexes-next-components";
import { Controller } from "react-hook-form";
import { useStayForm } from "./use-stay-form";
import { ExternalStayResponse } from "../services/externalStayService";
import DateField from "@/app/components/ui/date-field/DateField";

export function ExternalStayForm({
  externalListingId,
  onCreated,
}: {
  externalListingId: string;
  onCreated?: (stay: ExternalStayResponse) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    isPending,
    control,
  } = useStayForm(externalListingId, onCreated);

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Text size="sm" className="text-gray-500">
        El registro es manual: aquí no llega ninguna reserva automática de
        Airbnb/Booking/VRBO, debes capturarla cuando te avise la plataforma.
      </Text>

      <InputField
        helpText="Nombre del huésped"
        sizeHelp="xs"
        inputSize="sm"
        rounded="md"
        placeholder="Nombre del huésped"
        {...register("guestName")}
        errorMessage={errors.guestName?.message}
      />

      <InputField
        helpText="Correo del huésped"
        sizeHelp="xs"
        inputSize="sm"
        rounded="md"
        placeholder="huesped@correo.com"
        type="email"
        {...register("guestEmail")}
        errorMessage={errors.guestEmail?.message}
      />

      <div>
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <DateField
              label="Fecha de inicio"
              className="flex-1"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              errorMessage={errors.startDate?.message}
            />
          )}
        />

        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <DateField
              label="Fecha de fin"
              className="flex-1"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              errorMessage={errors.endDate?.message}
            />
          )}
        />
      </div>

      <InputField
        helpText="Cantidad de huéspedes"
        sizeHelp="xs"
        inputSize="sm"
        rounded="md"
        type="number"
        min={1}
        {...register("guestsCount")}
        errorMessage={errors.guestsCount?.message}
      />

      <Button
        type="submit"
        size="full"
        colVariant="success"
        disabled={isPending}
      >
        Registrar estadía
      </Button>
    </form>
  );
}
