"use client";
import React, { useRef, useState } from "react";
import {
  InputField,
  SelectField,
  Button,
  Text,
} from "complexes-next-components";
import { IoDocumentAttach } from "react-icons/io5";
import { Controller } from "react-hook-form";
import useFormContract from "./use-form";
import DateField from "@/app/components/ui/date-field/DateField";
import { MANAGEMENT_TYPE_LABEL } from "../../services/contractInsuranceService";

const MANAGEMENT_OPTIONS = (
  Object.keys(MANAGEMENT_TYPE_LABEL) as (keyof typeof MANAGEMENT_TYPE_LABEL)[]
).map((value) => ({ value, label: MANAGEMENT_TYPE_LABEL[value] }));

interface Props {
  tenantID: string;
  torre: string;
  apartment: string;
}

export default function ContractForm({ tenantID, torre, apartment }: Props) {
  const {
    register,
    setValue,
    control,
    onSubmit,
    errors,
    isLoading,
    managementType,
  } = useFormContract({
    tenantID,
    torre,
    apartment,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setValue("file", file, { shouldValidate: true });
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-6"
    >
      <InputField
        regexType="number"
        type="number"
        placeholder="Valor arriendo"
        helpText="Valor arriendo"
        sizeHelp="xs"
        inputSize="sm"
        rounded="md"
        {...register("rentAmount")}
        hasError={!!errors.rentAmount}
        errorMessage={errors.rentAmount?.message}
      />

      <InputField
        regexType="number"
        type="number"
        placeholder="Día de pago (1-31)"
        helpText="Día de pago"
        sizeHelp="xs"
        inputSize="sm"
        rounded="md"
        {...register("paymentDay")}
        hasError={!!errors.paymentDay}
        errorMessage={errors.paymentDay?.message}
      />

      <Controller
        name="startDate"
        control={control}
        render={({ field }) => (
          <DateField
            label="Fecha de inicio"
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
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
            errorMessage={errors.endDate?.message}
          />
        )}
      />

      <InputField
        regexType="safeChars"
        placeholder="Notas (opcional)"
        helpText="Notas"
        sizeHelp="xs"
        inputSize="sm"
        rounded="md"
        {...register("notes")}
      />

      {/* =========================
         🏢 ADMINISTRACIÓN DEL ARRIENDO
         De esto depende a quién le llegan los reportes de daño del
         arrendatario. Se puede cambiar después desde la ficha del contrato.
      ========================= */}
      {/* SelectField no es un <select> nativo: pinta lo que reciba en `value` e
          ignora el ref de register, así que el valor se fija con setValue. */}
      <SelectField
        {...register("managementType")}
        value={managementType ?? ""}
        onChange={(e) =>
          setValue("managementType", e.target.value as typeof managementType, {
            shouldValidate: true,
          })
        }
        label="¿Quién administra el arriendo?"
        defaultOption="Selecciona una opción"
        options={MANAGEMENT_OPTIONS}
        inputSize="full"
        rounded="md"
        hasError={!!errors.managementType}
        errorMessage={errors.managementType?.message}
      />

      {managementType !== "DIRECT" && (
        <div className="space-y-3 p-4 rounded-xl bg-purple-50 border border-purple-200">
          <Text size="xs" className="text-purple-800">
            Los reportes de daño del arrendatario se le enviarán por correo con
            número de radicado y las evidencias adjuntas.
          </Text>

          <InputField
            regexType="safeChars"
            placeholder="Nombre de la compañía"
            helpText={
              managementType === "INSURER" ? "Aseguradora" : "Inmobiliaria"
            }
            sizeHelp="xs"
            inputSize="full"
            rounded="md"
            {...register("insurerName")}
            hasError={!!errors.insurerName}
            errorMessage={errors.insurerName?.message}
          />

          {managementType === "INSURER" && (
            <InputField
              regexType="safeChars"
              placeholder="Número de póliza"
              helpText="Póliza"
              sizeHelp="xs"
              inputSize="full"
              rounded="md"
              {...register("insurerPolicyNumber")}
              hasError={!!errors.insurerPolicyNumber}
              errorMessage={errors.insurerPolicyNumber?.message}
            />
          )}

          <InputField
            regexType="email"
            type="email"
            placeholder="correo@aseguradora.com"
            helpText="Correo (allí llegan los reportes)"
            sizeHelp="xs"
            inputSize="full"
            rounded="md"
            {...register("insurerEmail")}
            hasError={!!errors.insurerEmail}
            errorMessage={errors.insurerEmail?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField
              regexType="safeChars"
              placeholder="Contacto (opcional)"
              helpText="Contacto"
              sizeHelp="xs"
              inputSize="full"
              rounded="md"
              {...register("insurerContactName")}
            />

            <InputField
              regexType="phone"
              placeholder="Teléfono (opcional)"
              helpText="Teléfono"
              sizeHelp="xs"
              inputSize="full"
              rounded="md"
              {...register("insurerPhone")}
            />
          </div>
        </div>
      )}

      {/* FILE */}
      <div className="border border-dashed border-gray-300 bg-gray-50 p-4 rounded-xl text-center">
        {!preview && (
          <IoDocumentAttach
            size={100}
            color="gray"
            className="cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          />
        )}

        <input
          type="file"
          hidden
          ref={fileInputRef}
          accept="application/pdf"
          onChange={handleFileChange}
        />

        {preview && <iframe src={preview} className="w-full h-64 mt-2" />}

        {errors.file && <Text colVariant="danger">{errors.file.message}</Text>}
      </div>

      <Button
        type="submit"
        colVariant="success"
        size="full"
        rounded="md"
        className="mt-2 !py-3 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
        disabled={isLoading}
      >
        Asignar contrato
      </Button>
    </form>
  );
}
