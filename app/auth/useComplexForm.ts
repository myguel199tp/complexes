"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm as useFormHook } from "react-hook-form";
import { object, string } from "yup";
import { LoginComplexRequest } from "./services/request/login";
import { setCookie } from "nookies";
import { route } from "../_domain/constants/routes";
import { loginComplexUser } from "./services/loginComplexServices";

export default function useComplexForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const router = useRouter();

  const schema = object({
    email: string().email("Correo inválido").required("Correo es requerido"),
    password: string().required("Contraseña es requerida"),
    name: string().required("Agregar nombre"),
    nameUnit: string().required("Agregar nombre del conjunto"),
  });

  const formMethods = useFormHook<LoginComplexRequest>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginComplexRequest) => {
    try {
      const response = await loginComplexUser(data);

      if (response.success) {
        setCookie(null, "accessToken", response.accessToken, {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          httpOnly: false,
        });

        localStorage.setItem("userName", response.user.name);
        localStorage.setItem("userLastName", response.user.lastName);
        localStorage.setItem("fileName", response.user.file);
        localStorage.setItem("rolName", response.user.rol);

        setIsSuccess(true);
        setShowFlag(true);
        setTimeout(() => setShowFlag(false), 3000);
        router.push(route.myprofile);
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
