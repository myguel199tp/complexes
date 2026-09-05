"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, Title } from "complexes-next-components";

/**
 * Acordeón de preguntas frecuentes.
 *
 * Las preguntas ya viven traducidas en `locales/*.json` bajo la clave `faqs`
 * (el modal de ayuda las usa completas). Este componente recibe los índices
 * que se quieren mostrar, para que cada página destaque las suyas sin
 * duplicar textos ni sacarlos de sincronía entre idiomas.
 */
interface FaqAccordionProps {
  /** Índices dentro del arreglo `faqs` de los archivos de idioma. */
  indexes: number[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function FaqAccordion({
  indexes,
  title = "Preguntas frecuentes",
  subtitle,
  className = "",
}: FaqAccordionProps) {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(indexes[0] ?? null);

  return (
    <section
      className={`mx-auto w-full max-w-4xl px-4 py-12 md:px-8 ${className}`}
      aria-labelledby="faq-title"
    >
      <div className="text-center">
        <Title id="faq-title" as="h2" size="sm" font="bold" className="text-3xl md:text-4xl">
          {title}
        </Title>

        {subtitle && (
          <Text size="md" className="mx-auto mt-4 max-w-2xl text-gray-500">
            {subtitle}
          </Text>
        )}
      </div>

      <div className="mt-8 space-y-3">
        {indexes.map((index) => {
          const question = t(`faqs.${index}.question`);
          const answer = t(`faqs.${index}.answer`);
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-black/5 bg-white/60 shadow-[0_10px_30px_rgba(0,0,0,.05)] backdrop-blur-xl"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-black/[.02]"
              >
                <Text size="sm" font="semi">
                  {question}
                </Text>

                <span
                  aria-hidden="true"
                  className={`shrink-0 text-cyan-700 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5">
                  <Text size="sm" className="leading-relaxed text-gray-500">
                    {answer}
                  </Text>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
