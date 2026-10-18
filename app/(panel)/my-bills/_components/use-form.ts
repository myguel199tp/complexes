import { boolean, InferType, mixed, object, string } from "yup";
import { useForm as useFormHook } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useMutationExpense } from "./expense-mutation";
import { useRegisterPettyCashExpenseMutation } from "./use-petty-cash";

const schema = object({
  // Pagado con la caja menor: entra ya pagado y sin aprobación, así que
  // necesita la fecha del pago.
  pettyCash: boolean().default(false),
  paymentDate: string().when("pettyCash", {
    is: true,
    then: (s) => s.required("Indica la fecha del pago"),
    otherwise: (s) => s.optional(),
  }),
  concept: string().required("Este campo es requerido"),
  amount: string().required(),
  period: string().required("Este campo es requerido"),
  categoryId: string().required("Este campo es requerido"),
  observations: string().required("Este campo es requerido"),
  // Cotización o factura de lo que se va a pagar: opcional, hay pagos que se
  // aprueban antes de tener la factura.
  file: mixed<File>()
    .nullable()
    .test(
      "fileSize",
      "El archivo es demasiado grande",
      (file) => !file || file.size <= 5_000_000,
    )
    .test(
      "fileType",
      "Solo se permiten archivos PDF",
      (file) => !file || file.type === "application/pdf",
    ),
  conjuntoId: string(),
});

type FormValues = InferType<typeof schema>;

export default function useForm() {
  const mutation = useMutationExpense();
  const pettyCashMutation = useRegisterPettyCashExpenseMutation();
  const showAlert = useAlertStore((state) => state.showAlert);
  const router = useRouter();
  const idConjunto = useConjuntoStore((state) => state.conjuntoId);

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      pettyCash: false,
      paymentDate: "",
      concept: "",
      amount: "",
      period: "",
      categoryId: "",
      observations: "",
      file: undefined,
      conjuntoId: String(idConjunto),
    },
  });

  const { register, handleSubmit, control, setValue, formState } = methods;
  const { errors } = formState;

  useEffect(() => {
    if (idConjunto) {
      setValue("conjuntoId", String(idConjunto));
    }
  }, [idConjunto, setValue]);

  const onSubmit = handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("concept", dataform.concept);
    formData.append("amount", dataform.amount);
    formData.append("period", dataform.period);
    formData.append("categoryId", dataform.categoryId);
    formData.append("observations", dataform.observations);
    if (dataform.file) {
      formData.append("file", dataform.file);
    }
    formData.append("conjuntoId", String(dataform.conjuntoId));

    if (!dataform.pettyCash) {
      await mutation.mutateAsync(formData);
      return;
    }

    formData.append("paymentDate", String(dataform.paymentDate));

    try {
      const { balance } = await pettyCashMutation.mutateAsync(formData);
      showAlert(
        `Gasto de caja menor registrado. Quedan ${balance.toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
          maximumFractionDigits: 0,
        })}.`,
        "success",
      );
      router.push(route.myBills);
    } catch (error) {
      // El backend dice por qué: por ejemplo, que no alcanza el saldo.
      showAlert(
        error instanceof Error ? error.message : "¡Algo salió mal!",
        "error",
      );
    }
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    control,
    watch: methods.watch,
    formState: { errors },
    isSuccess: mutation.isSuccess || pettyCashMutation.isSuccess,
  };
}
