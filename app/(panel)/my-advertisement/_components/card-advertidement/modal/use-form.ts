import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook } from "react-hook-form";
import { object, string, mixed, InferType } from "yup";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { PaymentMethod } from "../../../services/request/orderRequest";
import { useMutationOrder } from "./use-mutation-order";
import { useCartStore } from "../../cart.store";

/**
 * El formulario ya no pide `buyerId`, `sellerId` ni los productos: el comprador
 * sale del token y los productos salen del carrito. Antes el schema exigía
 * `buyerId` y `sellerId` sin que nada los llenara, así que el submit nunca
 * pasaba la validación de yup y era imposible cerrar una compra.
 */
export const schema = object({
  unitId: string().optional(),

  message: string().optional(),

  preferredPaymentMethod: mixed<PaymentMethod>()
    .oneOf(Object.values(PaymentMethod))
    .optional(),

  contactPhone: string().optional(),
  contactEmail: string().email("Correo inválido").optional(),
});

export type CheckoutFormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationOrder();

  const apartment = useConjuntoStore((state) => state.apartment);
  const groups = useCartStore((state) => state.groups);
  const items = useCartStore((state) => state.items);

  const methods = useFormHook<CheckoutFormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      // El apartamento del vecino ya lo sabemos: no hay por qué preguntarlo.
      unitId: apartment ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset,
  } = methods;

  const onSubmit = handleSubmit(async (dataform: CheckoutFormValues) => {
    // El carrito puede tener productos de varios negocios; cada uno recibe su
    // propio pedido porque cada uno acepta y entrega por separado.
    await mutation.mutateAsync({
      groups: groups(),
      contact: {
        unitId: dataform.unitId || undefined,
        message: dataform.message || undefined,
        preferredPaymentMethod: dataform.preferredPaymentMethod ?? undefined,
        contactPhone: dataform.contactPhone || undefined,
        contactEmail: dataform.contactEmail || undefined,
      },
    });

    reset({ unitId: apartment ?? "" });
  });

  return {
    register,
    handleSubmit: onSubmit,
    errors,
    watch,
    setValue,
    isEmpty: items.length === 0,
    sellerCount: groups().length,
    isSuccess: mutation.isSuccess,
    isLoading: mutation.isPending,
  };
}
