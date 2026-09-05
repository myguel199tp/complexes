"use client";

import { useEffect } from "react";
import { InferType, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { useMutationNewsForm } from "./use-mutation-news-form";
import { useMutationUpdateNewsForm } from "./use-mutation-news-update";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTokenPayload } from "@/app/components/session-provider";
import { useEnsembleInfo } from "@/app/(sets)/ensemble/components/ensemble-info";
import { useTranslation } from "react-i18next";
import { NewsAudience } from "./news-audience";

type News = {
  id: string;
  title: string;
  textmessage: string;
  mailAdmin: string;
  conjuntoId: string;
  fileUrl?: string;
  audience?: string | null;
  audienceTower?: string | null;
};

export default function useForm(newsData?: News, onUpdateSuccess?: () => void) {
  const useremail = useTokenPayload()?.email || "";

  const mutation = useMutationNewsForm();
  const mutationUpdate = useMutationUpdateNewsForm(
    newsData?.id,
    onUpdateSuccess,
  );

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
    audience: string().required(),
    /*
      Solo obligatoria cuando la noticia va a una torre. El backend aplica la
      misma regla: una noticia dirigida a una torre vacía no coincidiría con
      ninguna relación y quedaría publicada sin que la lea nadie.
    */
    audienceTower: string().when("audience", {
      is: NewsAudience.TOWER,
      then: (field) => field.required("Selecciona la torre destinataria"),
      otherwise: (field) => field.optional(),
    }),
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
  });

  type FormValues = InferType<typeof schema>;

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      title: newsData?.title || "",
      textmessage: newsData?.textmessage || "",
      mailAdmin: newsData?.mailAdmin || useremail,
      // Las noticias anteriores a las audiencias no traen el campo: eran para
      // todo el conjunto, y así se reabren al editarlas.
      audience: newsData?.audience ?? NewsAudience.ALL,
      audienceTower: newsData?.audienceTower ?? "",
      file: undefined,
    },
  });

  const { register, handleSubmit, setValue, watch, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (userunit) setValue("nameUnit", String(userunit));
  }, [conjuntoId, userunit, setValue]);

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("title", dataform.title || "");
    formData.append("mailAdmin", dataform.mailAdmin || "");
    formData.append("textmessage", dataform.textmessage || "");
    formData.append("audience", dataform.audience || NewsAudience.ALL);

    // Solo viaja con la audiencia que la usa: mandarla siempre dejaría una
    // torre guardada en noticias que no van dirigidas a ninguna.
    if (dataform.audience === NewsAudience.TOWER) {
      formData.append("audienceTower", dataform.audienceTower || "");
    }

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
    watch,
    formState: { errors },
    isLoading: mutation.isPending || mutationUpdate.isPending,
    isSuccess: mutation.isSuccess || mutationUpdate.isSuccess,
  };
}
