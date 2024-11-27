"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm as useFormHook } from "react-hook-form";
import { object, string } from "yup";
import { LoginRequest } from "./services/request/login";
import { loginUser } from "./services/loginServices";

export default function useForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const schema = object({
    email: string().email("Correo inválido").required("Correo es requerido"),
    password: string().required("Contraseña es requerida"),
  });

  const formMethods = useFormHook<LoginRequest>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      const response = await loginUser(data);

      if (response.ok && response.status === 200) {
        setIsSuccess(true);
        router.push("/users");
      } else {
        throw new Error("Error al registrar");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      setIsSuccess(false);
    }
  };

  return { ...formMethods, isSuccess, onSubmit };
}
