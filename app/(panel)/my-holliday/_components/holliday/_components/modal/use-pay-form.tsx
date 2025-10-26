import { useForm as useReactHookForm } from "react-hook-form";
import { InferType, object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutationPayHolliday } from "./mutation-pay-holliday";

const schema = object({
  fullName: string().required("El nombre completo es obligatorio"),
  idNumber: string().required("El número de identificación es obligatorio"),
  birthDate: string().required("La fecha de nacimiento es obligatoria"),
  address: string().required("La dirección es obligatoria"),
  email: string().email("Correo inválido").required("El correo es obligatorio"),
  phone: string().required("El teléfono es obligatorio"),

  bankName: string().required("El banco es obligatorio"),
  accountNumber: string().required("El número de cuenta es obligatorio"),
  accountType: string()
    .oneOf(["SAVINGS", "CHECKING"], "Tipo de cuenta no válido")
    .required("El tipo de cuenta es obligatorio"),

  swiftCode: string().optional(),
  routingNumber: string().optional(),
  clabe: string().optional(),
  iban: string().optional(),

  country: string().required("El país es obligatorio"),
  currency: string().required("La moneda es obligatoria"),
  paymentMethod: string()
    .oneOf(["CARD", "BANK_TRANSFER", "CASH", "PAYPAL"], "Método no válido")
    .required("El método de pago es obligatorio"),
});

type FormValues = InferType<typeof schema>;

export default function useFormHollidayPay() {
  const mutation = useMutationPayHolliday();

  const methods = useReactHookForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      idNumber: "",
      birthDate: "",
      address: "",
      email: "",
      phone: "",
      bankName: "",
      accountNumber: "",
      accountType: "SAVINGS",
      swiftCode: "",
      routingNumber: "",
      clabe: "",
      iban: "",
      country: "",
      currency: "",
      paymentMethod: "BANK_TRANSFER",
    },
  });

  const { register, handleSubmit, setValue, control, formState, watch } =
    methods;
  const { errors } = formState;

  const onSubmit = handleSubmit(
    async (data) => {
      try {
        // ✅ Enviar JSON directamente (no FormData, porque el backend espera JSON)
        await mutation.mutateAsync(data);
      } catch (error) {
        console.error("❌ Error al registrar el pago:", error);
      }
    },
    (errors) => {
      console.log("❌ Errores de validación:", errors);
    }
  );

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    watch,
    control,
    errors,
    isSuccess: mutation.isSuccess,
  };
}
