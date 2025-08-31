"use client";

import { route } from "@/app/_domain/constants/routes";
import { Title, Button } from "complexes-next-components";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import ModalPlanSummary from "./modal/modal";

export default function Aboutus() {
  const router = useRouter();
  const [selected, setSelected] = useState<{
    title: string;
    text: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const items = [
    {
      icon: "🔒",
      title: "Seguridad",
      text: "Disfruta de un sistema pensado para brindarte tranquilidad. Con herramientas que garantizan un control de accesos más eficiente y comunicación transparente con la administración, tu conjunto siempre estará protegido.",
    },
    {
      icon: "💬",
      title: "Comunicación",
      text: "Mantente informado en todo momento. Recibe notificaciones, comunicados y mensajes importantes directamente en tu dispositivo, evitando malentendidos y mejorando la relación con tus vecinos.",
    },
    {
      icon: "🏘️",
      title: "Comunidad",
      text: "Fortalece los lazos entre vecinos con herramientas que fomentan la colaboración y el sentido de pertenencia. La aplicación ayuda a crear un espacio más unido y participativo.",
    },
    {
      icon: "🏖️",
      title: "Alquiler vacacional",
      text: "Encuentra propiedades ideales para tus vacaciones o publica la tuya con confianza. Nuestro sistema asegura que tanto propietarios como arrendatarios tengan una experiencia segura y transparente.",
    },
    {
      icon: "💰",
      title: "Arrienda o vende",
      text: "Publica tu inmueble en minutos y llega a más personas interesadas en comprar o arrendar. La plataforma te permite dar visibilidad a tu propiedad sin complicaciones.",
    },
    {
      icon: "📞",
      title: "Citofonía Virtual",
      text: "Recibe las llamadas de la portería directamente en WhatsApp, sin necesidad de interfonos físicos. Una solución moderna que facilita el ingreso de visitantes y mejora la comunicación con la administración.",
    },
    {
      icon: "👥",
      title: "Gestión de usuarios",
      text: "Registra hasta cuatro subusuarios por vivienda, otorgando accesos personalizados para familiares o inquilinos. Cada usuario puede interactuar de acuerdo con su rol en la comunidad.",
    },
    {
      icon: "📢",
      title: "Avisos y comunicados",
      text: "No te pierdas ninguna novedad importante. Todos los avisos de la administración llegan en tiempo real a la aplicación para que siempre estés al tanto de lo que ocurre en tu conjunto.",
    },
    {
      icon: "📅",
      title: "Actividades",
      text: "Gestiona y participa en eventos o actividades comunitarias de manera organizada. Desde reuniones hasta eventos sociales, todo queda centralizado en un solo lugar.",
    },
    {
      icon: "🚪",
      title: "Registro de visitantes",
      text: "Controla quién entra a tu conjunto de forma rápida y ordenada. Los registros digitales reemplazan procesos manuales y aumentan la seguridad de la comunidad.",
    },
    {
      icon: "📝",
      title: "Registro de residentes",
      text: "Mantén actualizada la base de datos de los residentes. Este módulo permite saber exactamente quién vive en cada unidad, facilitando la gestión y la seguridad.",
    },
    {
      icon: "📰",
      title: "Página de noticias",
      text: "Consulta en un solo lugar todas las noticias y novedades de tu conjunto o comunidad. Información clara y accesible siempre al alcance de tu mano.",
    },
    {
      icon: "🛒",
      title: "Marketplace",
      text: "Compra y vende productos o servicios dentro de tu comunidad. Una forma sencilla de apoyar a emprendedores locales y resolver necesidades sin salir del conjunto.",
    },
    {
      icon: "📊",
      title: "Sistema contable",
      text: "Lleva las finanzas del conjunto con un sistema de contabilidad integrado. Genera reportes claros, gestiona pagos y mantén la transparencia en el uso de los recursos.",
    },
    {
      icon: "💬",
      title: "Foro de discusión",
      text: "Participa en debates y comparte ideas con tus vecinos. Un espacio abierto donde todos pueden opinar y proponer mejoras para la comunidad.",
    },
    {
      icon: "📂",
      title: "Gestión documental",
      text: "Consulta, organiza y almacena documentos importantes como actas, reglamentos o informes. Todo digitalizado y accesible en cualquier momento.",
    },
  ];

  const handleItemClick = (item: { title: string; text: string }) => {
    setSelected(item);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="border rounded-md mt-4 shadow-lg m-4">
        <section className="p-5">
          <div className="flex w-full bg-cyan-800 rounded-md justify-between">
            <Title size="xs" font="bold" className="p-2 rounded-md text-white">
              Qué ofrecemos
            </Title>
            <Button
              colVariant="warning"
              onClick={() => router.push(route.registerComplex)}
            >
              Inscribir conjunto
            </Button>
          </div>

          <div className="bg-white py-12 px-6">
            <div className="grid md:grid-cols-3 gap-8 text-center mt-8">
              {items.map((b, i) => (
                <div
                  key={i}
                  className="p-6 bg-blue-50 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() =>
                    handleItemClick({ title: b.title, text: b.text })
                  }
                >
                  <div className="text-4xl">{b.icon}</div>
                  <h3 className="text-xl font-bold mt-2">{b.title}</h3>
                  <p className="text-gray-600 mt-1">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {selected && (
        <ModalPlanSummary
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selected?.title || ""}
          text={selected?.text || ""}
        />
      )}
    </div>
  );
}
