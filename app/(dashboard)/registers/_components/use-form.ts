"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm as useFormHook } from "react-hook-form";
import { boolean, object, string } from "yup";
import { registerUser } from "../services/authService";
import { RegisterRequest } from "../services/request/register";

export default function useForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const schema = object({
    name: string().required("Nombre es requerido"),
    lastName: string().required("Apellido es requerido"),
    city: string().required("Ciudad es requerida"),
    phone: string().required("Teléfono es requerido"),
    email: string().email("Correo inválido").required("Correo es requerido"),
    password: string()
      .min(6, "Mínimo 6 caracteres")
      .required("Contraseña es requerida"),
    termsConditions: boolean()
      .oneOf([true], "Debes aceptar los términos y condiciones")
      .required(),
  });

  const formMethods = useFormHook<RegisterRequest>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: RegisterRequest) => {
    try {
      const response = await registerUser(data);

      if (response.ok && response.status === 201) {
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
