"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm as useFormHook } from "react-hook-form";
import { object, string } from "yup";
import { LoginRequest } from "./services/request/login";
import { loginUser } from "./services/loginServices";
import { setCookie } from "nookies";
import { route } from "../_domain/constants/routes";

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
        localStorage.setItem("unit", response.user.nameUnit);
        localStorage.setItem("userId", response.user._id);

        setIsSuccess(true);
        router.push(route.myprofile);
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
