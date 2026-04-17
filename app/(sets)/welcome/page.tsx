"use client";

import { Avatar, Title, Text, Button } from "complexes-next-components";
import React from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const userRole = useConjuntoStore((state) => state.role);
  const nameUser = useConjuntoStore((state) => state.nameUser);
  const lastName = useConjuntoStore((state) => state.lastName);
  const conjuntoName = useConjuntoStore((state) => state.conjuntoName);

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
              Bienvenido a SmartPH {conjuntoName}
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
          <strong>SmartPH</strong>. Tu cuenta fue creada correctamente y estás a
          un solo paso de comenzar a disfrutar de todas las herramientas que
          hemos preparado para facilitar la gestión de tu conjunto.
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
                ¿Ya realizaste el pago o crees que se trata de un error? Nuestro
                equipo está listo para ayudarte. Contáctanos y lo revisamos de
                inmediato.
              </Text>
            ) : (
              <Text size="xs" className="text-slate-500 mb-6">
                Si ya realizaste el pago o consideras que hay un inconveniente,
                comunícate con la administración del conjunto para validar tu
                estado de acceso.
              </Text>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
