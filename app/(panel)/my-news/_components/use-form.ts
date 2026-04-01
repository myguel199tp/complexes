"use client";

import { useEffect } from "react";
import { InferType, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { useMutationNewsForm } from "./use-mutation-news-form";
import { useMutationUpdateNewsForm } from "./use-mutation-news-update";
import { yupResolver } from "@hookform/resolvers/yup";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useEnsembleInfo } from "@/app/(sets)/ensemble/components/ensemble-info";
import { useTranslation } from "react-i18next";

type News = {
  id: string;
  title: string;
  textmessage: string;
  mailAdmin: string;
  conjuntoId: string;
  fileUrl?: string;
};

const payload = getTokenPayload();
const useremail = payload?.email || "";

export default function useForm(newsData?: News) {
  const mutation = useMutationNewsForm();
  const mutationUpdate = useMutationUpdateNewsForm(newsData?.id);

  const { data } = useEnsembleInfo();
  const { t } = useTranslation();

  const conjuntoId = data?.[0]?.conjunto.id || "";
  const userunit = data?.[0]?.conjunto.name || "";

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
    file: newsData
      ? mixed<File>().nullable()
      : mixed<File>()
          .required(t("archivoObligatorio"))
          .test(
            "fileSize",
            t("archivoMuyGrande"),
            (value) => !value || value.size <= 5000000,
          )
          .test(
            "fileType",
            t("tipoArchivoNoSoportado"),
            (value) =>
              !value || ["image/jpeg", "image/png"].includes(value.type),
          ),
    conjuntoId: string(),
  });

  type FormValues = InferType<typeof schema>;

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      title: newsData?.title || "",
      textmessage: newsData?.textmessage || "",
      mailAdmin: newsData?.mailAdmin || useremail,
      file: undefined,
      conjuntoId: newsData?.conjuntoId || String(conjuntoId),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (conjuntoId) setValue("conjuntoId", String(conjuntoId));
    if (userunit) setValue("nameUnit", String(userunit));
  }, [conjuntoId, userunit, setValue]);

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("title", dataform.title || "");
    formData.append("mailAdmin", dataform.mailAdmin || "");
    formData.append("textmessage", dataform.textmessage || "");
    formData.append("conjuntoId", dataform.conjuntoId || "");

    if (dataform.file) {
      formData.append("file", dataform.file);
    }

    if (newsData?.id) {
      await mutationUpdate.mutateAsync(formData);
    } else {
      await mutation.mutateAsync(formData);
    }
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    formState: { errors },
    isLoading: mutation.isPending || mutationUpdate.isPending,
    isSuccess: mutation.isSuccess || mutationUpdate.isSuccess,
  };
}
