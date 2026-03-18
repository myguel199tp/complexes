import { useForm as useReactHookForm } from "react-hook-form";
import { object, string, InferType } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutationPayHolliday } from "./mutation-pay-holliday";
import { useMutationSendOtp } from "./mutation-send-otp";
import { useState } from "react";

const schema = object({
  fullName: string().required("El nombre completo es obligatorio"),
  idNumber: string().required("El número de identificación es obligatorio"),
  email: string().email("Correo inválido").required("El correo es obligatorio"),
  phone: string().required("El teléfono es obligatorio"),
  bankName: string().required("El banco es obligatorio"),
  accountNumber: string().required("El número de cuenta es obligatorio"),

  accountType: string()
    .oneOf(["SAVINGS", "CHECKING"] as const, "Tipo de cuenta no válido")
    .required("El tipo de cuenta es obligatorio"),

  swiftCode: string().optional(),
  routingNumber: string().optional(),
  clabe: string().optional(),
  iban: string().optional(),

  country: string().required("El país es obligatorio"),
  currency: string().required("La moneda es obligatoria"),

  paymentMethod: string()
    .oneOf(
      ["CARD", "BANK_TRANSFER", "CASH", "PAYPAL"] as const,
      "Método no válido",
    )
    .required("El método de pago es obligatorio"),

  otp: string().optional(),
});

type FormValues = InferType<typeof schema>;
export default function useFormHollidayPay() {
  const mutationRegister = useMutationPayHolliday();
  const mutationSendOtp = useMutationSendOtp();
  const [otpSent, setOtpSent] = useState(false);

  const methods = useReactHookForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      idNumber: "",
      email: "",
      phone: "",
      bankName: "",
      accountNumber: "",
      accountType: "SAVINGS",
      swiftCode: "",
      routingNumber: "",
      clabe: "",
      iban: "",
      country: "Colombia",
      currency: "COP",
      paymentMethod: "BANK_TRANSFER",
      otp: "",
    } as FormValues,
  });

  const { register, handleSubmit, setValue, control, formState, watch } =
    methods;

  const { errors } = formState;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!otpSent) {
        await mutationSendOtp.mutateAsync(data?.email);
        setOtpSent(true);
        return;
      }

      if (!data?.otp) {
        alert("Por favor ingresa el código OTP enviado a tu correo.");
        return;
      }

      await mutationRegister.mutateAsync(data);
    } catch (error) {
      console.error("❌ Error al registrar el pago:", error);
    }
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    watch,
    control,
    errors,
    otpSent,
    isSuccess: mutationRegister.isSuccess,
    isSendingOtp: mutationSendOtp.isLoading,
  };
}
