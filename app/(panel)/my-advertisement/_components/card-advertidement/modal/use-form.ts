import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook, useFieldArray } from "react-hook-form";
import { object, string, boolean, mixed, InferType, number, array } from "yup";
import { useEffect } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  ICreateOrderRequest,
  PaymentMethod,
} from "../../../services/request/orderRequest";
import { useMutationOrder } from "./use-mutation-order";

export const schema = object({
  buyerId: string().required("El comprador es requerido"),
  sellerId: string().required("El vendedor es requerido"),
  conjuntoId: string().required("El conjunto es requerido"),
  unitId: string().nullable(),

  items: array()
    .of(
      object({
        productId: string().required("El producto es requerido"),
        quantity: number()
          .required("La cantidad es requerida")
          .min(1, "Debe ser al menos 1"),
      }),
    )
    .min(1, "Debe agregar al menos un producto")
    .required(),

  message: string().optional(),

  preferredPaymentMethod: mixed<PaymentMethod>()
    .oneOf(Object.values(PaymentMethod))
    .optional(),

  contactPhone: string().optional(),
  contactEmail: string().email("Correo inválido").optional(),

  noPlatformPayment: boolean().optional(),
});

type ForumFormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationOrder();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);

  const methods = useFormHook<ForumFormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      conjuntoId: String(idConjunto || ""),
      items: [
        {
          productId: "",
          quantity: 1,
        },
      ], // 👈 siempre inicia con 1 producto
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    control,
  } = methods;

  // 🔥 manejo dinámico de items
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // 🔥 sincronizar conjuntoId
  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }
  }, [idConjunto, setValue]);

  // 🚀 submit
  const onSubmit = handleSubmit(async (dataform: ForumFormValues) => {
    try {
      const payload: ICreateOrderRequest = {
        buyerId: dataform.buyerId,
        sellerId: dataform.sellerId!,
        unitId: dataform.unitId!,
        items: dataform.items,
        message: dataform.message || undefined,
        preferredPaymentMethod: dataform.preferredPaymentMethod ?? undefined,
        contactPhone: dataform.contactPhone || undefined,
        contactEmail: dataform.contactEmail || undefined,
        noPlatformPayment: dataform.noPlatformPayment || undefined,
        conjuntoId: dataform.conjuntoId,
      };

      await mutation.mutateAsync(payload);
    } catch (error) {
      console.error("❌ Error al enviar orden:", error);
    }
  });

  return {
    register,
    handleSubmit: onSubmit,
    errors,
    watch,
    setValue,
    fields,
    append,
    remove,
    isSuccess: mutation.isSuccess,
    isLoading: mutation.isPending,
  };
}
