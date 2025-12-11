import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook } from "react-hook-form";
import { object, string, boolean, mixed, InferType, number, array } from "yup";
import { useEffect } from "react";
import { useEnsembleInfo } from "@/app/(sets)/ensemble/components/ensemble-info";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  ICreateOrderRequest,
  PaymentMethod,
} from "../../../services/request/orderRequest";
import { useMutationOrder } from "./use-mutation-order";

export const schema = object({
  buyerId: string().required("El comprador es requerido"),
  sellerId: string().required("El vendedor es requerido"),
  conjunto_id: string().required("El conjunto es requerido"),
  unitId: string().nullable(),

  items: array()
    .of(
      object({
        productId: string().required("El producto es requerido"),
        quantity: number()
          .required("La cantidad es requerida")
          .min(1, "Debe ser al menos 1"),
      })
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
  const { data } = useEnsembleInfo();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);

  const userunit = data?.[0]?.conjunto.name || "";

  const methods = useFormHook<ForumFormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      conjunto_id: String(idConjunto),
      items: [],
    },
  });

  const { register, handleSubmit, setValue, formState, watch } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjunto_id", String(idConjunto));
    }
  }, [idConjunto, userunit, setValue]);

  const onSubmit = handleSubmit(async (dataform: ForumFormValues) => {
    console.log("Form data:", dataform);

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
        conjunto_id: dataform.conjunto_id,
      };

      await mutation.mutateAsync(payload);
    } catch (error) {
      console.error("❌ Error al enviar orden:", error);
    }
  });

  return {
    register,
    handleSubmit: onSubmit, // este será el submit final
    setValue,
    formState: { errors },
    watch,
    isSuccess: mutation.isSuccess,
  };
}
