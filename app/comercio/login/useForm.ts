"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useForm as useFormHook } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { InferType, object, string } from "yup";
import { loginComercio } from "./services/comercioAuthService";
import { ComercioLoginRequest } from "./services/request/login";
import { setComercioToken } from "../_lib/comercio-auth";
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
      const response = await mutation.mutateAsync(data as ComercioLoginRequest);

      setComercioToken(response.accessToken);
      showAlert("¡Inicio de sesión exitoso!", "success");
      router.push("/comercio/dashboard");
    } catch (error) {
      showAlert(error.message, "error");
    }
  };

  return { ...formMethods, onSubmit, isSubmitting: mutation.isLoading };
}
