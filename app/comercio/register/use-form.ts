"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useForm as useFormHook, Resolver } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { InferType, object, string } from "yup";
import { registerComercio } from "./services/comercioRegisterService";
import { ComercioRegisterRequest } from "./services/request/register";
import { useAlertStore } from "@/app/components/store/useAlertStore";

const schema = object({
  businessName: string().required("El nombre del negocio es requerido"),
  ownerName: string().required("El nombre del propietario es requerido"),
  email: string().email("Correo inválido").required("El correo es requerido"),
  password: string()
    .min(6, "Mínimo 6 caracteres")
    .required("La contraseña es requerida"),
  phone: string().required("El teléfono es requerido"),
  indicative: string().optional(),
  taxId: string().optional(),
  address: string().optional(),
  city: string().optional(),
  country: string().optional(),
  description: string().optional(),
});

type RegisterFormValues = InferType<typeof schema>;

export default function useForm() {
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);

  const methods = useFormHook<RegisterFormValues>({
    mode: "all",
    resolver: yupResolver(schema) as Resolver<RegisterFormValues>,
  });

  const mutation = useMutation({
    mutationFn: registerComercio,
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      await mutation.mutateAsync(data as ComercioRegisterRequest);

      showAlert("¡Comercio registrado exitosamente!", "success");
      router.push("/comercio/login");
    } catch (error) {
      showAlert(error.message, "error");
    }
  });

  return {
    ...methods,
    onSubmit,
    isSubmitting: mutation.isLoading,
  };
}
