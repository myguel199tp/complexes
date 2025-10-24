/* eslint-disable @next/next/no-img-element */
"use client";
import { Title, Text } from "complexes-next-components";
import { useLiveNews } from "./newsAll-info";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function NewsAll() {
  const { data, error, BASE_URL } = useLiveNews();
  const { language } = useLanguage();

  if (error) return <div>{error}</div>;

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

        // ✅ usar Intl.DateTimeFormat en lugar de toLocaleString
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
            className="w-full flex flex-col md:flex-row gap-5 p-5 m-2 border rounded-md"
          >
            {/* 📸 Imagen responsive */}
            <img
              className="rounded-lg w-full h-80 md:w-[400px] md:h-[200px] object-cover"
              alt={ele.title}
              src={`${BASE_URL}/uploads/${ele.file.replace(/^.*[\\/]/, "")}`}
            />

            {/* 📄 Contenido */}
            <div className="flex flex-col w-full rounded-sm p-2">
              <Title size="sm" font="bold" className="rounded-sm">
                {ele.title}
              </Title>

              <Text className="mt-2" size="sm">
                {ele.textmessage}
              </Text>

              {/* 📅 Fecha abajo siempre */}
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
