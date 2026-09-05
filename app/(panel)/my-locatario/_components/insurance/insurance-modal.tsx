"use client";

import React, { useRef } from "react";
import { Controller } from "react-hook-form";
import {
  Modal,
  InputField,
  SelectField,
  Button,
  Text,
} from "complexes-next-components";
import { IoDocumentAttach } from "react-icons/io5";

import DateField from "@/app/components/ui/date-field/DateField";
import { InsuranceValues, useInsuranceForm } from "./use-insurance-form";
import { ContractResponse } from "../../services/response/contractResponse";
import { MANAGEMENT_TYPE_LABEL } from "../../services/contractInsuranceService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contract: ContractResponse;
}

const MANAGEMENT_OPTIONS = (
  Object.keys(MANAGEMENT_TYPE_LABEL) as (keyof typeof MANAGEMENT_TYPE_LABEL)[]
).map((value) => ({ value, label: MANAGEMENT_TYPE_LABEL[value] }));

export default function InsuranceModal({ isOpen, onClose, contract }: Props) {
  const {
    register,
    setValue,
    control,
    errors,
    managementType,
    onSubmit,
    policyFile,
    selectPolicyFile,
    fileError,
    isSubmitting,
  } = useInsuranceForm(contract, onClose);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirect = managementType === "DIRECT";
  const isInsurer = managementType === "INSURER";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Administración del arriendo"
      className="max-w-2xl w-full"
    >
      <form onSubmit={onSubmit}>
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {/* SelectField no es un <select> nativo: pinta lo que reciba en `value`
            e ignora el ref de register, así que el valor se fija con setValue. */}
          <SelectField
            {...register("managementType")}
            value={managementType ?? ""}
            onChange={(e) =>
              setValue(
                "managementType",
                e.target.value as InsuranceValues["managementType"],
                { shouldValidate: true },
              )
            }
            label="¿Quién administra el arriendo?"
            defaultOption="Selecciona una opción"
            options={MANAGEMENT_OPTIONS}
            inputSize="full"
            rounded="md"
            hasError={!!errors.managementType}
            errorMessage={errors.managementType?.message}
          />

          {isDirect ? (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <Text size="xs" className="text-gray-600">
                Los reportes de daño del arrendatario te llegarán directamente a
                ti. Al guardar se borran los datos de la compañía que hubiera
                registrada.
              </Text>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputField
                  regexType="safeChars"
                  placeholder="Nombre de la compañía"
                  helpText={isInsurer ? "Aseguradora" : "Inmobiliaria"}
                  sizeHelp="xs"
                  inputSize="full"
                  rounded="md"
                  {...register("insurerName")}
                  hasError={!!errors.insurerName}
                  errorMessage={errors.insurerName?.message}
                />

                <InputField
                  regexType="alphanumeric"
                  placeholder="NIT (opcional)"
                  helpText="NIT"
                  sizeHelp="xs"
                  inputSize="full"
                  rounded="md"
                  {...register("insurerNit")}
                />
              </div>

              {isInsurer && (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputField
                  regexType="safeChars"
                  placeholder="Persona de contacto (opcional)"
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

              <InputField
                regexType="email"
                type="email"
                placeholder="correo@aseguradora.com"
                helpText="Correo (allí llegan los reportes de daño)"
                sizeHelp="xs"
                inputSize="full"
                rounded="md"
                {...register("insurerEmail")}
                hasError={!!errors.insurerEmail}
                errorMessage={errors.insurerEmail?.message}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Controller
                  name="insurerCoverageStart"
                  control={control}
                  render={({ field }) => (
                    <DateField
                      label="Vigencia desde"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      errorMessage={errors.insurerCoverageStart?.message}
                    />
                  )}
                />

                <Controller
                  name="insurerCoverageEnd"
                  control={control}
                  render={({ field }) => (
                    <DateField
                      label="Vigencia hasta"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      errorMessage={errors.insurerCoverageEnd?.message}
                    />
                  )}
                />
              </div>

              {/* PÓLIZA */}
              <div className="border border-dashed border-gray-300 bg-gray-50 p-4 rounded-xl space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-sm text-blue-600"
                >
                  <IoDocumentAttach size={22} />
                  {policyFile
                    ? policyFile.name
                    : "Adjuntar PDF de la póliza (opcional)"}
                </button>

                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept="application/pdf"
                  onChange={(e) => {
                    selectPolicyFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />

                {contract.insurerPolicyFileUrl && !policyFile && (
                  <Text size="xs" className="text-gray-500">
                    Ya hay una póliza cargada. Si no adjuntas otra, se conserva.
                  </Text>
                )}

                {fileError && (
                  <Text size="xs" colVariant="danger">
                    {fileError}
                  </Text>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-gray-200">
          <Button type="button" rounded="md" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            type="submit"
            colVariant="success"
            rounded="md"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
