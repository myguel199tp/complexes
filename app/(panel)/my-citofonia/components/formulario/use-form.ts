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
  visitType: string(),
  nameUnit: string(),
  apartment: string().required("Número de casa o apartamento es requerida"),
  plaque: string().optional(),
  file: mixed<File>()
    .nullable()
    .required("El archivo es obligatorio")
    .test(
      "fileSize",
      "El archivo es demasiado grande",
      (value) => !value || value.size <= 5000000
    )
    .test(
      "fileType",
      "Tipo de archivo no soportado",
      (value) => !value || ["image/jpeg", "image/png"].includes(value.type)
    ),
  conjunto_id: string(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationVisit();
  const { data } = useEnsembleInfo();

  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const userunit = data?.[0]?.conjunto.name || "";

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      nameUnit: userunit,
      conjunto_id: String(idConjunto),
      file: undefined,
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjunto_id", String(idConjunto));
    }
    if (userunit) {
      setValue("nameUnit", String(userunit));
    }
  }, [idConjunto, userunit, setValue]);

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("namevisit", dataform.namevisit || "");
    formData.append("numberId", dataform.numberId || "");
    formData.append("visitType", dataform.visitType || "");
    formData.append("nameUnit", dataform.nameUnit || "");
    formData.append("apartment", dataform.apartment || "");
    formData.append("plaque", dataform.plaque || "");

    if (dataform.file) {
      formData.append("file", dataform.file);
    }
    formData.append("conjunto_id", String(dataform.conjunto_id));

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
