import {
  Button,
  InputField,
  Modal,
  SelectField,
  Text,
  TextAreaField,
} from "complexes-next-components";
import React from "react";
import { Controller } from "react-hook-form";
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";
import { useFormContact } from "./use-form-contact";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  inmovableId: string;
  ownerId: string;
}

export default function ModalSummary({
  isOpen,
  onClose,
  inmovableId,
  ownerId,
}: Props) {
  const { register, control, errors, isSubmitting, handleSubmit } =
    useFormContact({
      inmovableId,
      ownerId,
      onSuccess: onClose,
    });

  const { indicativeOptions } = useCountryCityOptions();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Déjanos tus datos de contacto"
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Text size="sm" className="text-gray-600">
          Completa el siguiente formulario para que el anunciante pueda
          contactarte, resolver tus dudas y continuar con el proceso de la
          reserva.
          <br />
          <strong>No realizaremos ningún cobro en este paso.</strong>
        </Text>

        <div className="space-y-3">
          <InputField
            placeholder="Nombre y apellido"
            label="Nombre completo"
            inputSize="md"
            rounded="md"
            type="text"
            {...register("name")}
            hasError={!!errors.name}
            errorMessage={errors.name?.message}
          />

          <Controller
            control={control}
            name="countryCode"
            render={({ field }) => (
              <SelectField
                {...field}
                label="Indicativo del país"
                inputSize="md"
                rounded="md"
                options={indicativeOptions}
                defaultOption="Indicativo"
                searchable
                hasError={!!errors.countryCode}
                errorMessage={errors.countryCode?.message}
              />
            )}
          />

          <InputField
            placeholder="Ej: 3001234567"
            label="Número de celular"
            inputSize="md"
            rounded="md"
            type="tel"
            regexType="number"
            {...register("phoneNum")}
            hasError={!!errors.phoneNum}
            errorMessage={errors.phoneNum?.message}
          />

          <InputField
            placeholder="correo@ejemplo.com"
            label="Correo electrónico (opcional)"
            inputSize="md"
            rounded="md"
            type="email"
            {...register("maill")}
            hasError={!!errors.maill}
            errorMessage={errors.maill?.message}
          />

          <TextAreaField
            placeholder="Cuéntale al anunciante qué te interesa saber"
            label="Mensaje (opcional)"
            rows={3}
            {...register("descripton")}
            hasError={!!errors.descripton}
            errorMessage={errors.descripton?.message}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
          {isSubmitting ? "Enviando..." : "Guardar y solicitar contacto"}
        </Button>

        <Text size="xs" className="text-gray-500 text-center">
          Usaremos esta información únicamente para contactarte sobre tu
          solicitud.
        </Text>
      </form>
    </Modal>
  );
}
