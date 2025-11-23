/* eslint-disable @next/next/no-img-element */
"use client";

import { Title, Text } from "complexes-next-components";
import { useLiveNews } from "./newsAll-info";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function NewsAll() {
  const { data, error, BASE_URL } = useLiveNews();
  const { language } = useLanguage();

  // 🧩 Función que obtiene solo el message del error
  const extractErrorMessage = (err: unknown): string => {
    if (!err) return "Ocurrió un error inesperado";

    // Cuando el error viene como STRING de React Query o fetch
    if (typeof err === "string") {
      // Ej: "Error 403: {\"message\":\"Conjunto bloqueado...\","...
      const match = err.match(/\{.*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]); // Parse JSON dentro del string
          return parsed.message || err;
        } catch {
          return err;
        }
      }
      return err;
    }

    // Cuando el error es OBJETO normal
    if (typeof err === "object" && err !== null && "message" in err) {
      return (err as { message: string }).message;
    }

    return "Ocurrió un error inesperado";
  };

  // ⛔ Vista de error personalizada
  if (error)
    return (
      <div className="w-full p-6 rounded-xl bg-red-100 border border-red-400 text-red-700 text-center shadow-md mt-10">
        <Title size="lg" font="bold" className="mb-2">
          ⚠️ Acceso Restringido
        </Title>

        <Text size="md" className="font-semibold">
          {extractErrorMessage(error)}
        </Text>

        <Text size="sm" className="mt-2">
          Si crees que es un error, contacta a la administración del conjunto.
        </Text>
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
      {sortedData.map((ele, index) => {
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
            {/* Imagen */}
            <img
              className="rounded-lg w-full h-80 md:w-[400px] md:h-[300px] object-cover"
              alt={ele.title}
              src={`${BASE_URL}/uploads/${ele.file.replace(/^.*[\\/]/, "")}`}
            />

            {/* Contenido */}
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
      })}
    </div>
  );
}
