"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm as useFormHook } from "react-hook-form";
import { InferType, object, string } from "yup";
import { LoginRequest } from "./services/request/login";
import { LoginUser } from "./services/loginServices";
import { route } from "../_domain/constants/routes";
import { useTranslation } from "react-i18next";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useSession } from "@/app/components/session-provider";
import { getDeviceId } from "../helpers/device";

export default function useForm() {
  const { t } = useTranslation();
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { reload } = useSession();

  const showAlert = useAlertStore((state) => state.showAlert);

  const schema = object({
    email: string()
      .email(t("correoInvalido"))
      .required(t("correoSolicitado"))
      .matches(
        /^[\w.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "Solo se permiten correo",
      ),
    password: string().required(t("requerida")),
  });

  type LoginFormValues = InferType<typeof schema>;

  const formMethods = useFormHook<LoginFormValues>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      const response = await LoginUser({
        ...data,
        deviceId: getDeviceId(),
      });

      if (response.needOTP && response.userId) {
        router.push(`/verify-otp?userId=${response.userId}`);
        return;
      }

      if (
        response.success &&
        response.message === "Debes activar tu contraseña temporal"
      ) {
        router.push(`/activate-temp-password?userId=${response.userId}`);
        return;
      }

      if (response.authenticated) {
        showAlert("¡Inicio de sesión exitoso!", "success");

        // Las cookies ya las escribió /api/auth/login como httpOnly. Los roles
        // vienen en el cuerpo porque el cliente ya no puede leer el token.
        const roles = response.roles ?? [];

        // Refresca los claims de sesión que el layout resolvió en el servidor.
        await reload();

        // Solo el usuario "user puro" (sin otros roles) va directo a su perfil.
        // Cualquier otro rol (employee, owner, tenant, etc.) debe pasar por la
        // pantalla de selección de conjunto (/ensemble), que es quien consulta
        // /user-conjunto-relation/user.
        const isPlainUser = roles.length === 1 && roles[0] === "user";

        if (isPlainUser) {
          router.push(route.myprofile);
        } else {
          router.push(route.ensemble);
        }
      }
    } catch (error) {
      showAlert(error.message, "error");

      setIsSuccess(false);
    }
  };

  return { ...formMethods, isSuccess, onSubmit };
}
