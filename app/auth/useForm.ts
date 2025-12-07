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
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  nit: string;
  role: string;
  name: string;
  lastName: string;
  file: string;
  id: string;
  email: string;
};

export default function useForm() {
  const { t } = useTranslation();
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const schema = object({
    email: string()
      .email(t("correoInvalido"))
      .required(t("correoSolicitado"))
      .matches(
        /^[\w.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "Solo se permiten correo"
      ),
    password: string().required(t("requerida")),
  });

  const formMethods = useFormHook<LoginRequest>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      const response = await LoginUser(data);
      console.log("response", response);
      // 🔹 Caso OTP
      if (response.needOTP && response.userId) {
        // Redirige o muestra form de OTP

        router.push(`/verify-otp?userId=${response.userId}`);
        return;
      }

      // 🔹 Caso contraseña temporal
      if (
        response.success &&
        response.message === "Debes activar tu contraseña temporal"
      ) {
        router.push(`/activate-temp-password?userId=${response.userId}`);
        return;
      }

      // 🔹 Login normal
      if (response.accessToken && response.refreshToken) {
        setCookie(null, "accessToken", response.accessToken, {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          httpOnly: false,
          sameSite: "lax",
        });

        setCookie(null, "refreshToken", response.refreshToken, {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          httpOnly: false,
          sameSite: "lax",
        });

        const payload = jwtDecode<TokenPayload>(response.accessToken);
        const userrole = payload?.role;

        if (userrole === "user") {
          router.push(route.myprofile);
        } else {
          router.push(route.ensemble);
        }
      }
    } catch (error) {
      console.error("Error login:", error);
      setIsSuccess(false);
    }
  };

  return { ...formMethods, isSuccess, onSubmit };
}
