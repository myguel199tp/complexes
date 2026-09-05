/* eslint-disable react-hooks/exhaustive-deps */
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook } from "react-hook-form";
import { InferType, mixed, number, object, string } from "yup";

import { useMutationContract } from "./contract-mutation";

interface Props {
  tenantID: string;
  torre: string;
  apartment: string;
}

const schema = object({
  tenantId: string().required("Inquilino requerido"),
  tower: string().required("Torre requerida"),
  apartment: string().required("Apartamento requerido"),

  rentAmount: number().typeError("Debe ser número").required("Valor requerido"),

  paymentDay: number()
    .typeError("Debe ser número")
    .min(1, "Mínimo 1")
    .max(31, "Máximo 31")
    .required("Día de pago requerido"),

  startDate: string().required("Fecha inicio requerida"),
  endDate: string().required("Fecha fin requerida"),

  notes: string().optional(),

  /**
   * Quién administra el arriendo. Se pregunta aquí y no solo después
   * porque el propietario que ya contrató la póliza no debería tener que
   * volver a entrar al contrato para registrarla.
   *
   * Las reglas repiten las del DTO del backend: con compañía de por medio
   * hacen falta el nombre y el correo —sin correo no hay a quién avisarle
   * de un daño— y el número de póliza solo si es aseguradora.
   */
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
      then: (s) => s.required("Correo requerido para enviarle reportes"),
      otherwise: (s) => s.optional(),
    }),

  insurerPolicyNumber: string().when("managementType", {
    is: "INSURER",
    then: (s) => s.required("Número de póliza requerido"),
    otherwise: (s) => s.optional(),
  }),

  insurerPhone: string().optional(),
  insurerContactName: string().optional(),

  file: mixed<File>()
    .nullable()
    .required("El archivo es obligatorio")
    .test(
      "fileSize",
      "El archivo es demasiado grande",
      (file) => !file || file.size <= 5_000_000,
    )
    .test(
      "fileType",
      "Solo se permiten archivos PDF",
      (file) => !file || file.type === "application/pdf",
    ),
});

type FormValues = InferType<typeof schema>;

export default function useFormContract({ tenantID, torre, apartment }: Props) {
  const mutation = useMutationContract();

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      tenantId: tenantID, // ✅ mapping correcto
      tower: torre, // ✅ mapping correcto
      apartment: apartment, // ✅ mapping correcto
      managementType: "DIRECT",
    },
  });

  const { register, setValue, handleSubmit, formState, watch } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData();

    formData.append("tenantId", data.tenantId);
    formData.append("tower", data.tower);
    formData.append("apartment", data.apartment);
    formData.append("rentAmount", String(data.rentAmount));
    formData.append("paymentDay", String(data.paymentDay));
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);

    if (data.notes) {
      formData.append("notes", data.notes);
    }

    formData.append("managementType", data.managementType);

    // Con DIRECT no se manda nada de la compañía: el backend valida los
    // campos solo cuando el tipo lo exige, y un string vacío sí llega.
    if (data.managementType !== "DIRECT") {
      const insurerFields: [string, string | undefined][] = [
        ["insurerName", data.insurerName],
        ["insurerEmail", data.insurerEmail],
        ["insurerPolicyNumber", data.insurerPolicyNumber],
        ["insurerContactName", data.insurerContactName],
        ["insurerPhone", data.insurerPhone],
      ];

      insurerFields.forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
    }

    if (data.file instanceof File) {
      formData.append("file", data.file);
    }

    await mutation.mutateAsync(formData);
  });

  return {
    ...methods,
    errors: formState.errors,
    onSubmit,
    register,
    setValue,
    managementType: watch("managementType"),
    isLoading: mutation.isPending,
  };
}
