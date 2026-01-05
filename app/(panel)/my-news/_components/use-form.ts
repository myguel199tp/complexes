"use client";
import { useEffect } from "react";
import { InferType, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { useMutationNewsForm } from "./use-mutation-news-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useEnsembleInfo } from "@/app/(sets)/ensemble/components/ensemble-info";
import { useTranslation } from "react-i18next";

const payload = getTokenPayload();
const useremail = payload?.email || "";

export default function useForm() {
  const mutation = useMutationNewsForm();
  const { data } = useEnsembleInfo();
  const { t } = useTranslation();

  const conjuntoId = data?.[0]?.conjunto.id || "";
  const userunit = data?.[0]?.conjunto.name || "";

  // ✅ Schema definido dentro del hook (igual que en login form)
  const schema = object({
    title: string().required(t("noticiaTituloRequerido")),
    textmessage: string()
      .required(t("noticiaMensajeRequerido"))
      .min(10, t("mensajeMinimo10"))
      .max(200, t("mensajeMaximo200")),
    nameUnit: string(),
    mailAdmin: string()
      .email(t("correoInvalido"))
      .required(t("correoRequerido")),
    file: mixed<File>()
      .nullable()
      .required(t("archivoObligatorio"))
      .test(
        "fileSize",
        t("archivoMuyGrande"),
        (value) => !value || value.size <= 5000000
      )
      .test(
        "fileType",
        t("tipoArchivoNoSoportado"),
        (value) => !value || ["image/jpeg", "image/png"].includes(value.type)
      ),
    conjunto_id: string(),
  });

  type FormValues = InferType<typeof schema>;

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      nameUnit: String(userunit),
      mailAdmin: useremail,
      file: undefined,
      conjunto_id: String(conjuntoId),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  // 🔹 Actualizar valores cuando llegue la data del ensemble
  useEffect(() => {
    if (conjuntoId) {
      setValue("conjunto_id", String(conjuntoId));
    }
    if (userunit) {
      setValue("nameUnit", String(userunit));
    }
  }, [conjuntoId, userunit, setValue]);

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("title", dataform.title || "");
    formData.append("mailAdmin", dataform.mailAdmin || "");
    formData.append("nameUnit", dataform.nameUnit || "");
    formData.append("textmessage", dataform.textmessage || "");

    if (dataform.file) {
      formData.append("file", dataform.file);
    }

    formData.append("conjunto_id", dataform.conjunto_id || "");

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
