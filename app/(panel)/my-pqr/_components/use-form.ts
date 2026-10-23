"use client";
export const dynamic = "force-dynamic";

import { InferType, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useMutationCertificationPqr } from "./use-pqr-mutation";
import { useTokenPayload } from "@/app/components/session-provider";

/** Los mismos tipos y tope que acepta el backend para la imagen de prueba. */
export const EVIDENCE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];
export const EVIDENCE_MAX_BYTES = 8 * 1024 * 1024;

const schema = object({
  iduser: string(),
  type: string().required(),
  radicado: string().required(),
  description: string(),
  tower: string(),
  apartment: string(),
  numberId: string(),
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
  /** Foto de prueba opcional; el backend la guarda en la raíz privada. */
  evidence: mixed<File>()
    .nullable()
    .optional()
    .test(
      "fileSize",
      "La imagen no puede pesar más de 8 MB",
      (file) => !file || file.size <= EVIDENCE_MAX_BYTES,
    )
    .test(
      "fileType",
      "La imagen debe ser JPG, PNG, WEBP, GIF o HEIC",
      (file) => !file || EVIDENCE_MIME.includes(file.type),
    ),
  nameUnit: string(),
  conjuntoId: string(),
});

type FormValues = InferType<typeof schema>;

export default function useForm(radicado: string) {
  const mutation = useMutationCertificationPqr();

  const payload = useTokenPayload();
  const storedUserId = payload?.id ?? null;

  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const conjuntoName = useConjuntoStore((state) => state.conjuntoName);
  const apartment = useConjuntoStore((state) => state.apartment);
  const tower = useConjuntoStore((state) => state.tower);

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      iduser: String(storedUserId),
      radicado: radicado,
      tower: String(tower),
      apartment: String(apartment),
      nameUnit: String(conjuntoName),
      file: undefined,
      evidence: null,
      conjuntoId: String(idConjunto),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }
    if (conjuntoName) {
      setValue("nameUnit", String(conjuntoName));
    }
  }, [idConjunto, conjuntoName, setValue]);

  // defaultValues sólo se aplica en el primer render; si la sesión llega
  // después, el id del usuario hay que escribirlo a mano.
  useEffect(() => {
    if (storedUserId) {
      setValue("iduser", String(storedUserId));
    }
  }, [storedUserId, setValue]);

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();
    formData.append("iduser", String(dataform.iduser));
    formData.append("type", String(dataform.type));
    formData.append("radicado", String(dataform.radicado));
    formData.append("description", String(dataform.description));
    formData.append("tower", String(dataform.tower));
    formData.append("apartment", String(dataform.apartment));
    formData.append("numberId", String(dataform.numberId));

    if (dataform.file) {
      formData.append("file", dataform.file);
    }
    if (dataform.evidence) {
      formData.append("evidence", dataform.evidence);
    }
    formData.append("conjuntoId", String(dataform.conjuntoId));
    formData.append("nameUnit", dataform.nameUnit || "");

    await mutation.mutateAsync(formData);
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    formState: { errors },
    isSuccess: mutation.isSuccess,
  };
}
