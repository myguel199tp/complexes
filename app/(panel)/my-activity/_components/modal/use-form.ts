import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook } from "react-hook-form";
import { object, string, boolean, mixed, InferType, number } from "yup";
import { useEffect } from "react";
import { useEnsembleInfo } from "@/app/(sets)/ensemble/components/ensemble-info";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useMutationUpdateActivity } from "../use-mutation-activity-update";

const schema = object({
  status: boolean().required(),
  nameUnit: string(),
  inChargue: string().required("El encargado es obligatorio"),
  cuantity: number().required("cantidad de residentes es obligatorio"),
  // Sin tope se deja vacío: solo rige el aforo total
  maxPerApartment: number()
    .nullable()
    .transform((value, original) =>
      original === "" || original === null ? null : value,
    )
    .min(1, "El máximo por apartamento debe ser al menos 1")
    .test(
      "notAboveCapacity",
      "No puede superar la cantidad total de residentes",
      function (value) {
        if (value === null || value === undefined) return true;

        const { cuantity } = this.parent as { cuantity?: number };

        if (typeof cuantity !== "number" || isNaN(cuantity)) return true;

        return value <= cuantity;
      },
    ),
  activity: string().required(),
  description: string()
    .required()
    .min(10, "mensajeMinimo10")
    .max(450, "mensajeMaximo450"),
  dateHourStart: string()
    .nullable()
    .required("La fecha de inicio es requerida"),
  dateHourEnd: string()
    .nullable()
    .required("La fecha de finalización es requerida"),
  duration: number(),
  file: mixed<File>()
    .nullable()
    .required("El archivo es obligatorio")
    .test(
      "fileSize",
      "El archivo es demasiado grande",
      (value) => !value || value.size <= 5_000_000
    )
    .test(
      "fileType",
      "Tipo de archivo no soportado",
      (value) => !value || ["image/jpeg", "image/png"].includes(value.type)
    ),
  conjuntoId: string(),
});

type FormValues = InferType<typeof schema>;

export default function useForm(id: string) {
  const mutation = useMutationUpdateActivity(id);
  const { data } = useEnsembleInfo();

  const idConjunto = useConjuntoStore((state) => state.conjuntoId);
  const userunit = data?.[0]?.conjunto.name || "";

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      status: false,
      nameUnit: String(userunit),
      file: undefined,
      conjuntoId: String(idConjunto),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }
    if (userunit) {
      setValue("nameUnit", String(userunit));
    }
  }, [idConjunto, userunit, setValue]);

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();
    formData.append("status", String(dataform.status));
    formData.append("nameUnit", dataform.nameUnit || "");
    formData.append("inChargue", dataform.inChargue);
    formData.append("cuantity", String(dataform.cuantity));

    // Se envía siempre: vacío significa "quitar el tope" y el backend
    // interpreta la cadena vacía como null.
    formData.append(
      "maxPerApartment",
      dataform.maxPerApartment === null ||
        dataform.maxPerApartment === undefined
        ? ""
        : String(dataform.maxPerApartment),
    );

    formData.append("activity", dataform.activity);
    formData.append("description", dataform.description);
    formData.append("dateHourStart", String(dataform.dateHourStart));
    formData.append("dateHourEnd", String(dataform.dateHourEnd));
    formData.append("duration", String(dataform.duration));
    if (dataform.file) {
      formData.append("file", dataform.file);
    }
    formData.append("conjuntoId", String(dataform.conjuntoId));
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
