"use client";

import { Title, Text } from "complexes-next-components";
import React from "react";
import { useTermQuery } from "./_components/useTermQuery";
import { ImSpinner9 } from "react-icons/im";

export default function Page() {
  const { data, isLoading } = useTermQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );
  }

  const term = data?.[0];

  if (!term) {
    return <div className="p-8">No hay términos disponibles</div>;
  }

  return (
    <div className="p-8 space-y-4">
      {/* Título principal */}
      <Title size="md" font="bold">
        {term.title}
      </Title>

      {/* Contenido */}
      {term.content
        .sort((a, b) => a.order - b.order)
        .map((item) => (
          <div key={item.order} className="space-y-1">
            <Text font="bold" size="md">
              {item.order}. {item.title}
            </Text>
            <Text size="sm">{item.body}</Text>
          </div>
        ))}
    </div>
  );
}
