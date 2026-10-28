"use client";
export const dynamic = "force-dynamic";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  ActivationError,
  ActivationErrorCode,
  activateTempPassword,
  resendActivationLink,
} from "@/app/auth/services/active-temp";
import { useSession } from "@/app/components/session-provider";
import { Title, Text } from "complexes-next-components";
import { useEffect, useState } from "react";
import { route } from "@/app/_domain/constants/routes";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  ShieldCheck,
  LockKeyhole,
  CheckCircle2,
  Clock3,
  MailCheck,
  ShieldAlert,
} from "lucide-react";
import { ImSpinner9 } from "react-icons/im";
import { InputField } from "@/app/components/ui/form";
import { decodeJWT } from "@/app/helpers/decodeJWT";

const schema = yup.object({
  password: yup
    .string()
    .required("La contraseña es obligatoria")
    .min(8, "Debe tener al menos 8 caracteres")
    .matches(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
    .matches(/\d/, "Debe incluir al menos un número")
    .matches(/[^A-Za-z0-9]/, "Debe incluir al menos un símbolo especial"),

  confirmPassword: yup
    .string()
    .required("Debes confirmar la contraseña")
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden"),
});

type FormData = yup.InferType<typeof schema>;

type LinkStatus = "valid" | "expired" | "already-active" | "invalid";

const STATUS_BY_CODE: Record<ActivationErrorCode, LinkStatus> = {
  ACTIVATION_TOKEN_EXPIRED: "expired",
  ACCOUNT_ALREADY_ACTIVE: "already-active",
  ACTIVATION_TOKEN_INVALID: "invalid",
};

/**
 * El enlace dura 30 minutos y casi nadie abre el correo a tiempo: se lee el
 * vencimiento del token para no hacerle llenar el formulario en vano. Si no
 * se puede leer, decide el backend al enviar.
 */
function statusFromToken(token: string | undefined): LinkStatus {
  const payload = decodeJWT(token);

  if (typeof payload?.exp === "number" && payload.exp * 1000 < Date.now()) {
    return "expired";
  }

  return "valid";
}

export default function ActivateTempPassword() {
  const router = useRouter();
  const { reload } = useSession();
  const params = useParams();
  const token = params.token as string;

  // Se calcula tras montar: con Date.now() en el render del servidor el HTML
  // no coincidiría con el del cliente.
  const [linkStatus, setLinkStatus] = useState<LinkStatus | null>(null);

  useEffect(() => {
    setLinkStatus(statusFromToken(token));
  }, [token]);

  const [resend, setResend] = useState<{
    sending: boolean;
    sentTo?: string;
    error?: string;
  }>({ sending: false });

  const handleResend = async () => {
    setResend({ sending: true });

    try {
      const response = await resendActivationLink(token);
      setResend({ sending: false, sentTo: response.email ?? "tu correo" });
    } catch (err: unknown) {
      if (err instanceof ActivationError && err.code) {
        setResend({ sending: false });
        setLinkStatus(STATUS_BY_CODE[err.code]);
        return;
      }

      setResend({
        sending: false,
        error:
          err instanceof Error
            ? err.message
            : "No pudimos enviar el enlace. Intenta de nuevo.",
      });
    }
  };

  const [serverError, setServerError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const hasMinLength = passwordValue.length >= 8;
  const hasUpperCase = /[A-Z]/.test(passwordValue);
  const hasNumber = /\d/.test(passwordValue);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(passwordValue);

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setServerError("El enlace no es válido o ha expirado.");
      return;
    }

    setServerError("");

    try {
      const response = await activateTempPassword(token, data.password);

      // /api/auth/activate-account ya guardó la sesión como cookies httpOnly
      // (mismo modelo que login y verify-otp); aquí sólo se refrescan los claims.
      if (response.authenticated) {
        await reload();
      }

      router.push(route.ensemble);
    } catch (err: unknown) {
      // Enlace vencido o cuenta ya activa: se cambia de pantalla para
      // ofrecer la salida (pedir otro enlace, ir a iniciar sesión).
      if (err instanceof ActivationError && err.code) {
        setLinkStatus(STATUS_BY_CODE[err.code]);
        return;
      }

      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Ocurrió un error activando tu contraseña.");
      }
    }
  };

  const passwordRules = [
    {
      label: "Mínimo 8 caracteres",
      valid: hasMinLength,
    },
    {
      label: "Una letra mayúscula",
      valid: hasUpperCase,
    },
    {
      label: "Un número",
      valid: hasNumber,
    },
    {
      label: "Un símbolo especial",
      valid: hasSpecialChar,
    },
  ];

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#050816]
        flex
        items-center
        justify-center
        px-4
        py-10
      "
    >
      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-150px] left-[-120px] w-[320px] h-[320px] bg-emerald-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-[-140px] right-[-100px] w-[320px] h-[320px] bg-cyan-500/20 blur-3xl rounded-full" />

      {/* CARD */}
      <div
        className="
          relative
          z-10
          w-full
          max-w-lg
          rounded-[32px]
          border
          border-white/10
          bg-white/[0.05]
          backdrop-blur-2xl
          shadow-[0_20px_80px_rgba(0,0,0,0.45)]
          overflow-hidden
        "
      >
        {/* TOP BAR */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400" />

        <div className="p-6 sm:p-10">
          {linkStatus === null ? (
            <div className="flex justify-center py-16">
              <ImSpinner9 className="animate-spin text-emerald-400" size={32} />
            </div>
          ) : linkStatus !== "valid" ? (
            <LinkProblem
              status={linkStatus}
              resend={resend}
              onResend={handleResend}
              onLogin={() => router.push(route.auth)}
            />
          ) : (
            <>
              {/* HEADER */}
              <div className="text-center mb-8">
                <div
                  className="
                w-20
                h-20
                mx-auto
                rounded-3xl
                bg-emerald-500/10
                border
                border-emerald-500/20
                flex
                items-center
                justify-center
                mb-5
              "
                >
                  <LockKeyhole className="w-10 h-10 text-emerald-400" />
                </div>

                <Title size="sm" font="bold" className="text-white">
                  Activa tu contraseña
                </Title>

                <Text className="text-gray-400 mt-3">
                  Crea una contraseña segura para acceder a tu cuenta.
                </Text>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* PASSWORD */}
                <div>
                  <div className="relative">
                    <InputField
                      type={showPassword ? "text" : "password"}
                      helpText="Nueva contraseña"
                      sizeHelp="xs"
                      inputSize="md"
                      rounded="lg"
                      placeholder="••••••••"
                      {...register("password")}
                      onChange={(e) => setPasswordValue(e.target.value)}
                      hasError={!!errors.password}
                      errorMessage={errors.password?.message}
                      className="pr-12"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                    hover:text-white
                    transition-colors
                  "
                    >
                      {showPassword ? (
                        <FiEyeOff size={20} />
                      ) : (
                        <FiEye size={20} />
                      )}
                    </button>
                  </div>

                  {/* PASSWORD RULES */}
                  <div
                    className="
                  mt-4
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-3
                "
                  >
                    {passwordRules.map((rule) => (
                      <div
                        key={rule.label}
                        className={`
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      px-3
                      py-2
                      text-sm
                      border
                      transition-all
                      ${
                        rule.valid
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                          : "bg-white/[0.03] border-white/10 text-gray-400"
                      }
                    `}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {rule.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <div className="relative">
                    <InputField
                      type={showConfirmPassword ? "text" : "password"}
                      helpText="Confirmar contraseña"
                      sizeHelp="xs"
                      inputSize="md"
                      rounded="lg"
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                      hasError={!!errors.confirmPassword}
                      errorMessage={errors.confirmPassword?.message}
                      className="pr-12"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                    hover:text-white
                    transition-colors
                  "
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff size={20} />
                      ) : (
                        <FiEye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* SECURITY INFO */}
                <div
                  className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-emerald-500/10
                bg-emerald-500/5
                px-4
                py-3
              "
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />

                  <Text className="text-sm text-emerald-200">
                    Tu contraseña se almacenará de forma segura.
                  </Text>
                </div>

                {/* SERVER ERROR */}
                {serverError && (
                  <div
                    className="
                  rounded-2xl
                  border
                  border-red-500/20
                  bg-red-500/10
                  px-4
                  py-3
                "
                  >
                    <Text className="text-sm text-red-300">{serverError}</Text>
                  </div>
                )}

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className={`
                w-full
                rounded-2xl
                py-4
                font-semibold
                text-white
                transition-all
                duration-300
                shadow-lg
                ${
                  isSubmitting || !isValid
                    ? "bg-emerald-500/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:scale-[1.01] active:scale-[0.99]"
                }
              `}
                >
                  {isSubmitting ? "Activando..." : "Activar contraseña"}
                </button>
              </form>

              {/* FOOTER */}
              <div className="mt-8 text-center">
                <Text className="text-gray-500 text-sm">
                  Una vez activada, podrás iniciar sesión con tu nueva
                  contraseña.
                </Text>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const PRIMARY_BUTTON =
  "w-full rounded-2xl py-4 font-semibold text-white shadow-lg transition-all duration-300 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100";

/** Lo que ve el usuario cuando el enlace ya no sirve para activar. */
function LinkProblem({
  status,
  resend,
  onResend,
  onLogin,
}: {
  status: Exclude<LinkStatus, "valid">;
  resend: { sending: boolean; sentTo?: string; error?: string };
  onResend: () => void;
  onLogin: () => void;
}) {
  if (status === "already-active") {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>

        <Title size="sm" font="bold" className="text-white">
          Tu cuenta ya está activa
        </Title>

        <Text size="sm" className="text-gray-400">
          Ya creaste tu contraseña. Inicia sesión con tu correo y esa
          contraseña; si no la recuerdas, puedes recuperarla desde el inicio de
          sesión.
        </Text>

        <button type="button" onClick={onLogin} className={PRIMARY_BUTTON}>
          Ir a iniciar sesión
        </button>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-red-400" />
        </div>

        <Title size="sm" font="bold" className="text-white">
          Este enlace no es válido
        </Title>

        <Text size="sm" className="text-gray-400">
          Revisa que hayas abierto el enlace completo del correo. Si sigue
          fallando, pide a la administración de tu conjunto que te reenvíe la
          invitación.
        </Text>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <Clock3 className="w-10 h-10 text-amber-400" />
      </div>

      <Title size="sm" font="bold" className="text-white">
        Tu enlace de activación venció
      </Title>

      <Text size="sm" className="text-gray-400">
        Por seguridad, el enlace solo dura 30 minutos. Te enviamos uno nuevo al
        correo con el que te registraron.
      </Text>

      {resend.sentTo && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-left">
          <MailCheck className="w-5 h-5 shrink-0 text-emerald-400" />
          <Text size="sm" className="text-emerald-200">
            Listo: enviamos un enlace nuevo a {resend.sentTo}. Ábrelo en los
            próximos 30 minutos y, si no lo ves, revisa la carpeta de spam.
          </Text>
        </div>
      )}

      {resend.error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-left">
          <Text size="sm" className="text-red-300">
            {resend.error}
          </Text>
        </div>
      )}

      <button
        type="button"
        onClick={onResend}
        disabled={resend.sending}
        className={PRIMARY_BUTTON}
      >
        {resend.sending
          ? "Enviando..."
          : resend.sentTo
            ? "Enviar otra vez"
            : "Enviarme un nuevo enlace"}
      </button>
    </div>
  );
}
