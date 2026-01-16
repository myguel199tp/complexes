/* eslint-disable @next/next/no-img-element */
"use client";

import { Title, Text, Button, Avatar } from "complexes-next-components";
import { useLiveNews } from "./newsAll-info";
import { useLanguage } from "@/app/hooks/useLanguage";
import ModalAdmin from "./modal/modal";
import { useEffect, useState } from "react";
import MessageNotData from "@/app/components/messageNotData";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { IoReturnDownBackOutline } from "react-icons/io5";

export default function NewsAll() {
  const { data, error, BASE_URL } = useLiveNews();
  const { language } = useLanguage();
  const router = useRouter();
  const userRole = useConjuntoStore((state) => state.role);
  const nameUser = useConjuntoStore((state) => state.nameUser);
  const lastName = useConjuntoStore((state) => state.lastName);
  const conjuntoName = useConjuntoStore((state) => state.conjuntoName);

  const [showPagoAdmin, setShowPagoAdmin] = useState<boolean>(true);
  const closeVideo = () => setShowPagoAdmin(false);

  useEffect(() => {
    if (error) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    }
  }, [error]);

  const extractErrorMessage = (err: unknown): string => {
    if (!err) return "Ocurrió un error inesperado";

    if (typeof err === "string") {
      const match = err.match(/\{.*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          return parsed.message || err;
        } catch {
          return err;
        }
      }
      return err;
    }

    if (typeof err === "object" && err !== null && "message" in err) {
      return (err as { message: string }).message;
    }

    return "Ocurrió un error inesperado";
  };

  if (error)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-4xl mx-4 p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-xl">
          <div className="flex justify-around  my-6">
            <Avatar
              src={"/complex.jpg"}
              alt="complex"
              size="lg"
              border="none"
              shape="rounded"
            />
            <div>
              <Title size="md" font="bold" className="mb-4 ">
                Bienvenido a Complexes {conjuntoName}
              </Title>
            </div>

            <div className="bg-white/20 p-2 rounded-full cursor-pointer">
              <IoReturnDownBackOutline
                size={30}
                className="cursor-pointer"
                onClick={() => {
                  router.push(route.ensemble);
                }}
              />
            </div>
          </div>

          <Text size="md" className="text-slate-700 mb-3">
            Hola, {nameUser} {lastName} 👋 Nos alegra darte la bienvenida a{" "}
            <strong>Complexes</strong>. Tu cuenta fue creada correctamente y
            estás a un solo paso de comenzar a disfrutar de todas las
            herramientas que hemos preparado para facilitar la gestión de tu
            conjunto.
          </Text>

          <Text size="sm" className="text-slate-600 mb-4">
            Para activar completamente tu acceso y habilitar todas las
            funcionalidades, es necesario contar con el pago activo del período
            correspondiente. Este paso garantiza el correcto funcionamiento del
            sistema y el acceso a todos los beneficios de la plataforma.
          </Text>

          <Text size="sm" className="text-slate-600 mb-6">
            Haz clic en el botón a continuación y activa tu cuenta en pocos
            segundos 🚀
          </Text>

          {userRole === "employee" ? (
            <>
              <Button
                className="w-full max-w-md mx-auto"
                colVariant="success"
                onClick={() => {
                  router.push(route.payComplexes);
                }}
              >
                Activar mi acceso
              </Button>
              {userRole === "employee" ? (
                <Text size="xs" className="text-slate-500 mb-6">
                  ¿Ya realizaste el pago o crees que se trata de un error?
                  Nuestro equipo está listo para ayudarte. Contáctanos y lo
                  revisamos de inmediato.
                </Text>
              ) : (
                <Text size="xs" className="text-slate-500 mb-6">
                  Si ya realizaste el pago o consideras que hay un
                  inconveniente, comunícate con la administración del conjunto
                  para validar tu estado de acceso.
                </Text>
              )}
              <Text size="xxs" className="font-semibold">
                {extractErrorMessage(error)}
              </Text>
            </>
          ) : null}
        </div>
      </div>
    );

  const locales: Record<string, string> = {
    es: "es-CO",
    en: "en-US",
    pt: "pt-BR",
  };

  const sortedData = [...data].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div key={language}>
      {sortedData.length === 0 ? (
        <MessageNotData />
      ) : (
        sortedData.map((ele, index) => {
          const key = ele.id || `news-${index}`;

          const formattedDate = new Intl.DateTimeFormat(
            locales[language] || "es-CO",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }
          ).format(new Date(ele.createdAt));

          return (
            <div
              key={key}
              className="w-full flex flex-col md:flex-row gap-5 p-5 m-2 border rounded-md bg-white"
            >
              <img
                className="rounded-lg w-full h-80 md:w-[400px] md:h-[300px] object-cover"
                alt={ele.title}
                src={`${BASE_URL}/uploads/${ele.file.replace(/^.*[\\/]/, "")}`}
              />

              <div className="flex flex-col w-full rounded-sm p-2">
                <Title size="sm" font="bold">
                  {ele.title}
                </Title>

                <Text className="mt-2" size="sm">
                  {ele.textmessage}
                </Text>

                <div className="mt-auto text-right">
                  <Text size="xxs">{formattedDate}</Text>
                </div>
              </div>
            </div>
          );
        })
      )}

      {showPagoAdmin && <ModalAdmin isOpen onClose={closeVideo} />}
    </div>
  );
}
