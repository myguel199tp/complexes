import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, InferType } from "yup";

import {
  countryMap,
  phoneLengthByCountry,
} from "@/app/helpers/longitud-telefono";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useMutationContact } from "../use-mutation-contact";

const schema = object({
  name: string().required("El nombre es obligatorio"),

  /* El select entrega "+57-Colombia": el país se usa para validar la longitud */
  countryCode: string().required("El indicativo es obligatorio"),

  phoneNum: string()
    .required("El celular es obligatorio")
    .matches(/^[0-9]+$/, "Solo se permiten números")
    .test(
      "len",
      "Longitud inválida para el país seleccionado",
      function (value) {
        const { countryCode } = this.parent;
        if (!countryCode || !value) return true;

        const countryName = countryCode.split("-")[1]?.trim()?.toUpperCase();
        const country = countryMap[countryName];
        const expectedLength = phoneLengthByCountry[country ?? ""];

        if (!expectedLength) return true;
        return value.length === expectedLength;
      },
    ),

  maill: string().email("El correo no es válido").optional(),
  descripton: string().optional(),
});

export type ContactFormValues = InferType<typeof schema>;

interface Params {
  inmovableId: string;
  ownerId: string;
  onSuccess: () => void;
}

export function useFormContact({ inmovableId, ownerId, onSuccess }: Params) {
  const mutation = useMutationContact(onSuccess);
  const storedUserId = useConjuntoStore((state) => state.userId);

  const methods = useForm<ContactFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      countryCode: "",
      phoneNum: "",
      maill: "",
      descripton: "",
    },
  });

  const handleSubmit = methods.handleSubmit(async (dataform) => {
    await mutation.mutateAsync({
      inmovableId,
      ownerId,
      /* opcional: solo viaja si el visitante tenía sesión iniciada */
      ...(storedUserId ? { iduser: storedUserId } : {}),
      name: dataform.name,
      /* al backend solo va el indicativo, sin el nombre del país */
      countryCode: dataform.countryCode.split("-")[0],
      phoneNum: dataform.phoneNum,
      maill: dataform.maill || undefined,
      descripton: dataform.descripton || undefined,
    });
  });

  return {
    ...methods,
    errors: methods.formState.errors,
    isSubmitting: mutation.isPending,
    handleSubmit,
  };
}
