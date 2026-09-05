"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook } from "react-hook-form";
import { InferType, object, string } from "yup";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { updateContractInsuranceService } from "../../services/contractInsuranceService";
import { ContractResponse } from "../../services/response/contractResponse";

/**
 * Las reglas siguen a las del DTO del backend: con aseguradora o inmobiliaria
 * son obligatorios el nombre y el correo, y el número de póliza solo cuando es
 * aseguradora. Sin correo no hay a quién avisarle de un daño y la solicitud se
 * quedaría muerta.
 */
const schema = object({
  managementType: string()
    .oneOf(["DIRECT", "INSURER", "AGENCY"])
    .required("Selecciona quién administra"),

  insurerName: string().when("managementType", {
    is: (value: string) => value !== "DIRECT",
    then: (s) => s.required("Nombre de la compañía requerido"),
    otherwise: (s) => s.optional(),
  }),

  insurerEmail: string()
    .email("Correo inválido")
    .when("managementType", {
      is: (value: string) => value !== "DIRECT",
      then: (s) => s.required("Correo requerido para poder enviarle reportes"),
      otherwise: (s) => s.optional(),
    }),

  insurerPolicyNumber: string().when("managementType", {
    is: "INSURER",
    then: (s) => s.required("Número de póliza requerido"),
    otherwise: (s) => s.optional(),
  }),

  insurerNit: string().optional(),
  insurerContactName: string().optional(),
  insurerPhone: string().optional(),
  insurerCoverageStart: string().optional(),
  insurerCoverageEnd: string().optional(),
});

export type InsuranceValues = InferType<typeof schema>;

export function useInsuranceForm(
  contract: ContractResponse,
  onDone: () => void,
) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const queryClient = useQueryClient();

  const [policyFile, setPolicyFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const methods = useFormHook<InsuranceValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      managementType: contract.managementType ?? "DIRECT",
      insurerName: contract.insurerName ?? "",
      insurerNit: contract.insurerNit ?? "",
      insurerPolicyNumber: contract.insurerPolicyNumber ?? "",
      insurerContactName: contract.insurerContactName ?? "",
      insurerPhone: contract.insurerPhone ?? "",
      insurerEmail: contract.insurerEmail ?? "",
      insurerCoverageStart: contract.insurerCoverageStart ?? "",
      insurerCoverageEnd: contract.insurerCoverageEnd ?? "",
    },
  });

  const { handleSubmit, watch, control, formState } = methods;

  const managementType = watch("managementType");

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      updateContractInsuranceService(conjuntoId, Number(contract.id), data),
    onSuccess: (response) => {
      showAlert(response.message ?? "Datos guardados", "success");

      queryClient.invalidateQueries({ queryKey: ["query_contract"] });
      queryClient.invalidateQueries({ queryKey: ["query_contract_rent"] });

      onDone();
    },
    onError: () => {
      showAlert("No se pudieron guardar los datos", "error");
    },
  });

  const selectPolicyFile = (file?: File | null) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      setFileError("La póliza debe ser un PDF");
      return;
    }

    if (file.size > 5_000_000) {
      setFileError("El PDF supera los 5 MB");
      return;
    }

    setFileError(null);
    setPolicyFile(file);
  };

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData();

    formData.append("managementType", data.managementType);

    // Pasar a DIRECT no manda los campos de la compañía: el backend los limpia
    // por su cuenta, y mandarlos vacíos los haría fallar la validación.
    if (data.managementType !== "DIRECT") {
      const optional: [string, string | undefined][] = [
        ["insurerName", data.insurerName],
        ["insurerNit", data.insurerNit],
        ["insurerPolicyNumber", data.insurerPolicyNumber],
        ["insurerContactName", data.insurerContactName],
        ["insurerPhone", data.insurerPhone],
        ["insurerEmail", data.insurerEmail],
        ["insurerCoverageStart", data.insurerCoverageStart],
        ["insurerCoverageEnd", data.insurerCoverageEnd],
      ];

      optional.forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      if (policyFile) formData.append("policyFile", policyFile);
    }

    await mutation.mutateAsync(formData);
  });

  return {
    ...methods,
    control,
    errors: formState.errors,
    managementType,
    onSubmit,
    policyFile,
    selectPolicyFile,
    fileError,
    isSubmitting: mutation.isPending,
  };
}
