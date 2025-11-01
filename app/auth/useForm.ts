"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm as useFormHook } from "react-hook-form";
import { object, string } from "yup";
import { LoginRequest } from "./services/request/login";
import { LoginUser } from "./services/loginServices";
import { setCookie } from "nookies";
import { route } from "../_domain/constants/routes";
import { getTokenPayload } from "../helpers/getTokenPayload";
import { useTranslation } from "react-i18next";

export default function useForm() {
  const { t } = useTranslation();
  const [isSuccess, setIsSuccess] = useState(false);
  const payload = getTokenPayload();
  const userrole = payload?.role || "";
  const router = useRouter();
  const schema = object({
    email: string().email(t("correoInvalido")).required(t("correoSolicitado")),
    password: string().required(t("requerida")),
  });

  const formMethods = useFormHook<LoginRequest>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      const response = await LoginUser(data);

      if (response.success) {
        setCookie(null, "accessToken", response.accessToken, {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          httpOnly: false,
          sameSite: "lax",
        });

        setIsSuccess(true);
        if (userrole === "user") {
          router.push(route.myprofile);
        } else {
          router.push(route.ensemble);
        }
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
