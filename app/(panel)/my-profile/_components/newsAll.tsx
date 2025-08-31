/* eslint-disable @next/next/no-img-element */
"use client";
import { Title, Text } from "complexes-next-components";
import { useNewsAllInfo } from "./newsAll-info";

export default function NewsAll() {
  const { data, error, BASE_URL } = useNewsAllInfo();

  if (error) return <div>{error}</div>;

  // Ordenar de más reciente a más antigua
  const sortedData = [...data].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <>
      {sortedData.map((ele, index) => {
        const key = ele.id || `news-${index}`;
        const formattedDate = new Date(ele.createdAt).toLocaleString("es-CO", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={key}
            className="w-full flex flex-col md:flex-row gap-5 p-5 m-2 border rounded-md"
          >
            <img
              className="rounded-lg w-40 h-40 md:w-60 md:h-60 object-cover"
              alt={ele.title}
              src={`${BASE_URL}/uploads/${ele.file.replace(/^.*[\\/]/, "")}`}
            />
            <div className="flex flex-col w-full rounded-sm p-2 relative">
              <Title size="sm" font="bold" className="rounded-sm">
                {ele.title}
              </Title>
              <Text className="mt-2">{ele.textmessage}</Text>

              {/* Fecha en esquina inferior derecha */}
              <Text className="absolute bottom-2 right-2 text-gray-500 text-sm">
                {formattedDate}
              </Text>
            </div>
          </div>
        );
      })}
    </>
  );
}
