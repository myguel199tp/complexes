"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { array, mixed, object, string } from "yup";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  transferOwnershipService,
  TransferOwnershipRequest,
} from "../../services/transferOwnershipService";

export interface TransferFormValues {
  name: string;
  lastName: string;
  email: string;
  indicative: string;
  phone: string;
  numberId: string;
  country?: string;
  city?: string;
  tower?: string;
  file?: File | null;
  familyInfo: {
    nameComplet: string;
    lastComplet: string;
    email: string;
    indicative?: string;
    phones?: string;
    numberId?: string;
    dateBorn?: string | null;
    country?: string;
    city?: string;
  }[];
  vehicles: {
    plaque: string;
    type: "carro" | "moto";
    parkingType: "publico" | "privado";
    assignmentNumber?: string;
  }[];
}

const schema = object({
  name: string().required("Nombre es requerido"),
  lastName: string().required("Apellido es requerido"),
  email: string().email("Correo inválido").required("Correo es requerido"),
  indicative: string().required("Indicativo es requerido"),
  phone: string()
    .required("Teléfono es requerido")
    .matches(/^[0-9]+$/, "Solo se permiten números"),
  numberId: string().required("Cédula es requerida"),
  country: string().optional(),
  city: string().optional(),
  tower: string().optional(),
  file: mixed<File | null>().nullable().optional(),

  familyInfo: array()
    .of(
      object({
        nameComplet: string().required("Nombre es requerido"),
        lastComplet: string().required("Apellido es requerido"),
        // Sin correo el backend descarta al familiar en silencio
        email: string()
          .email("Correo inválido")
          .required("El correo del familiar es obligatorio"),
        indicative: string().optional(),
        phones: string().optional(),
        numberId: string().optional(),
        dateBorn: string().nullable().optional(),
        country: string().optional(),
        city: string().optional(),
      }),
    )
    .default([]),

  vehicles: array()
    .of(
      object({
        plaque: string().required("La placa es requerida"),
        type: string().oneOf(["carro", "moto"]).required(),
        parkingType: string().oneOf(["publico", "privado"]).required(),
        assignmentNumber: string().optional(),
      }),
    )
    .default([]),
});

interface Props {
  /** Id del usuario propietario saliente */
  oldOwnerId?: string;
  conjuntoId: string;
  apartment: string;
  onSuccess: () => void;
}

export function useTransferForm({
  oldOwnerId,
  conjuntoId,
  apartment,
  onSuccess,
}: Props) {
  const showAlert = useAlertStore((state) => state.showAlert);
  const queryClient = useQueryClient();

  const methods = useForm<TransferFormValues>({
    mode: "onBlur",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      indicative: "",
      phone: "",
      numberId: "",
      country: "",
      city: "",
      tower: "",
      file: null,
      familyInfo: [],
      vehicles: [],
    },
  });

  const family = useFieldArray({
    control: methods.control,
    name: "familyInfo",
  });

  const vehicles = useFieldArray({
    control: methods.control,
    name: "vehicles",
  });

  const mutation = useMutation({
    mutationFn: (payload: TransferOwnershipRequest) =>
      transferOwnershipService(payload),
    onSuccess: () => {
      // La tabla debe reflejar de inmediato al nuevo propietario
      queryClient.invalidateQueries({ queryKey: ["query_user_register"] });
      showAlert("¡Propiedad transferida correctamente!", "success");
      methods.reset();
      onSuccess();
    },
    onError: (error: Error) => {
      showAlert(error.message || "No se pudo transferir la propiedad", "error");
    },
  });

  const handleSubmit = methods.handleSubmit((values) => {
    if (!oldOwnerId) {
      showAlert("No se identificó al propietario actual", "error");
      return;
    }

    return mutation.mutateAsync({
      oldOwnerId,
      conjuntoId,
      apartment,
      ...values,
    });
  });

  return {
    ...methods,
    handleSubmit,
    family,
    vehicles,
    isLoading: mutation.isLoading,
  };
}
