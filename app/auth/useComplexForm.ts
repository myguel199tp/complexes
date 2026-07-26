"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm as useFormHook } from "react-hook-form";
import { InferType, object, string } from "yup";
import { LoginComplexRequest } from "./services/request/login";
import { route } from "../_domain/constants/routes";
import { loginComplexUser } from "./services/loginComplexServices";
import { useSession } from "@/app/components/session-provider";

export default function useComplexForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const router = useRouter();
  const { reload } = useSession();

  const schema = object({
    email: string().email("Correo inválido").required("Correo es requerido"),
    password: string().required("Contraseña es requerida"),
    name: string().required("Agregar nombre"),
    nameUnit: string().required("Agregar nombre del conjunto"),
  });

  type LoginFormValues = InferType<typeof schema>;

  const formMethods = useFormHook<LoginFormValues>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginComplexRequest) => {
    try {
      const response = await loginComplexUser(data);

      if (response.authenticated) {
        // La sesión la escribió /api/auth/verify-otp como cookies httpOnly.
        await reload();

        setIsSuccess(true);
        setShowFlag(true);
        setTimeout(() => setShowFlag(false), 3000);
        router.push(route.ensemble);
      } else {
        throw new Error("Error al registrar");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      setIsSuccess(false);
    }
  };

  return {
    ...formMethods,
    isSuccess,
    showFlag,
    onSubmit,
  };
}
