import { InferType, mixed, object, string } from "yup";
import { useMutationVisit } from "./useVisitMutation";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEnsembleInfo } from "@/app/(sets)/ensemble/components/ensemble-info";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useEffect } from "react";

const schema = object({
  namevisit: string().required("Nombre es requerido"),
  numberId: string().required("Número de identificación es requerido"),
  visitType: string().required("Tipo de visitante requerido"),
  nameUnit: string(),
  apartment: string().required("Número de casa o apartamento es requerida"),
  plaque: string().optional(),
  file: mixed<File>()
    .nullable()
    .required("La foto es obligatoria")
    .test(
      "fileSize",
      "El archivo es demasiado grande (máx 5MB)",
      (value) => !!value && value.size <= 5_000_000
    )
    .test(
      "fileType",
      "Solo se permiten imágenes JPG o PNG",
      (value) => !!value && ["image/jpeg", "image/png"].includes(value.type)
    ),
  conjuntoId: string().required(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationVisit();
  const { data } = useEnsembleInfo();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const userunit = data?.[0]?.conjunto.name || "";

  const methods = useFormHook<FormValues>({
    mode: "onSubmit",
    resolver: yupResolver(schema),
    defaultValues: {
      nameUnit: userunit,
      conjuntoId: idConjunto ? String(idConjunto) : "",
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (idConjunto) setValue("conjuntoId", String(idConjunto));
    if (userunit) setValue("nameUnit", userunit);
  }, [idConjunto, userunit, setValue]);

  const onSubmit = handleSubmit(async (dataform) => {
    console.log("✅ submit ejecutado");

    const formData = new FormData();
    formData.append("namevisit", dataform.namevisit);
    formData.append("numberId", dataform.numberId);
    formData.append("visitType", dataform.visitType);
    formData.append("nameUnit", dataform.nameUnit ?? "");
    formData.append("apartment", dataform.apartment);
    formData.append("plaque", dataform.plaque ?? "");
    formData.append("file", dataform.file as File);
    formData.append("conjuntoId", dataform.conjuntoId);

    await mutation.mutateAsync(formData);
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    errors,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
  };
}
