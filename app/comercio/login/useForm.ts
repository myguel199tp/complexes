"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useForm as useFormHook } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { InferType, object, string } from "yup";
import { loginComercio } from "./services/comercioAuthService";
import { ComercioLoginRequest } from "./services/request/login";
import { useAlertStore } from "@/app/components/store/useAlertStore";

const schema = object({
  email: string().email("Correo inválido").required("El correo es requerido"),
  password: string().required("La contraseña es requerida"),
});

type LoginFormValues = InferType<typeof schema>;

export default function useForm() {
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);

  const formMethods = useFormHook<LoginFormValues>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
  });

  const mutation = useMutation({
    mutationFn: loginComercio,
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // /api/comercio/login ya dejó la sesión en una cookie httpOnly.
      await mutation.mutateAsync(data as ComercioLoginRequest);

      showAlert("¡Inicio de sesión exitoso!", "success");
      router.push("/comercio/dashboard");
    } catch (error) {
      showAlert(error.message, "error");
    }
  };

  return { ...formMethods, onSubmit, isSubmitting: mutation.isLoading };
}
