/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useMemo } from "react";
import { Modal, Text, InputField } from "complexes-next-components";
import { FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

interface AccordionItemProps {
  question: string;
  answer: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <div
      key={language}
      className="rounded-xl border border-gray-200 bg-white transition hover:shadow-sm"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <Text className="font-medium text-gray-800">{question}</Text>
        <span className="text-gray-500">
          {open ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
        </span>
      </button>

      {open && (
        <div className="px-5 pb-4">
          <Text className="text-sm leading-relaxed text-gray-600">
            {answer}
          </Text>
        </div>
      )}
    </div>
  );
};

export default function ModalFAQ({ isOpen, onClose }: Props) {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");

  const faqs = [
    // 💰 Contratación y pagos
    {
      question: t("faqs.0.question"),
      answer: t("faqs.0.answer"),
    },
    {
      question: t("faqs.1.question"),
      answer: t("faqs.1.answer"),
    },
    {
      question: t("faqs.2.question"),
      answer: t("faqs.2.answer"),
    },
    {
      question: t("faqs.3.question"),
      answer: t("faqs.3.answer"),
    },
    {
      question: t("faqs.4.question"),
      answer: t("faqs.4.answer"),
    },

    // 🛠 Funcionalidades
    {
      question: t("faqs.5.question"),
      answer: t("faqs.5.answer"),
    },
    {
      question: t("faqs.6.question"),
      answer: t("faqs.6.answer"),
    },
    {
      question: t("faqs.7.question"),
      answer: t("faqs.7.answer"),
    },
    {
      question: t("faqs.8.question"),
      answer: t("faqs.8.answer"),
    },
    {
      question: t("faqs.9.question"),
      answer: t("faqs.9.answer"),
    },

    // 📱 Uso de la aplicación
    {
      question: t("faqs.10.question"),
      answer: t("faqs.10.answer"),
    },
    {
      question: t("faqs.11.question"),
      answer: t("faqs.11.answer"),
    },
    {
      question: t("faqs.12.question"),
      answer: t("faqs.12.answer"),
    },
    {
      question: t("faqs.13.question"),
      answer: t("faqs.13.answer"),
    },
    {
      question: t("faqs.14.question"),
      answer: t("faqs.14.answer"),
    },

    // 🔒 Seguridad y soporte
    {
      question: t("faqs.15.question"),
      answer: t("faqs.15.answer"),
    },
    {
      question: t("faqs.16.question"),
      answer: t("faqs.16.answer"),
    },
    {
      question: t("faqs.17.question"),
      answer: t("faqs.17.answer"),
    },

    // 💳 Pagos extra
    {
      question: t("faqs.18.question"),
      answer: t("faqs.18.answer"),
    },
    {
      question: t("faqs.19.question"),
      answer: t("faqs.19.answer"),
    },
    {
      question: t("faqs.20.question"),
      answer: t("faqs.20.answer"),
    },
    {
      question: t("faqs.21.question"),
      answer: t("faqs.12.answer"),
    },
    {
      question: t("faqs.22.question"),
      answer: t("faqs.22.answer"),
    },

    // 🎨 Personalización
    {
      question: t("faqs.23.question"),
      answer: t("faqs.23.answer"),
    },
    {
      question: t("faqs.24.question"),
      answer: t("faqs.24.answer"),
    },
    {
      question: t("faqs.25.question"),
      answer: t("faqs.25.answer"),
    },
    {
      question: t("faqs.26.question"),
      answer: t("faqs.26.answer"),
    },

    // 🔗 Integraciones
    {
      question: t("faqs.27.question"),
      answer: t("faqs.27.answer"),
    },
    {
      question: t("faqs.28.question"),
      answer: t("faqs.28.answer"),
    },
    {
      question: t("faqs.29.question"),
      answer: t("faqs.29.answer"),
    },

    // 👥 Experiencia de usuario
    {
      question: t("faqs.30.question"),
      answer: t("faqs.30.answer"),
    },
    {
      question: t("faqs.31.question"),
      answer: t("faqs.31.answer"),
    },
    {
      question: t("faqs.32.question"),
      answer: t("faqs.32.answer"),
    },
    {
      question: t("faqs.33.question"),
      answer: t("faqs.33.answer"),
    },
    {
      question: t("faqs.34.question"),
      answer: t("faqs.34.answer"),
    },

    // 📞 Soporte y garantías
    {
      question: t("faqs.35.question"),
      answer: t("faqs.35.answer"),
    },
    {
      question: t("faqs.36.question"),
      answer: t("faqs.36.answer"),
    },
    {
      question: t("faqs.37.question"),
      answer: t("faqs.37.answer"),
    },
    {
      question: t("faqs.38.question"),
      answer: t("faqs.38.answer"),
    },

    // 🎯 Beneficios prácticos
    {
      question: t("faqs.39.question"),
      answer: t("faqs.39.answer"),
    },
    {
      question: t("faqs.40.question"),
      answer: t("faqs.40.answer"),
    },
    {
      question: t("faqs.41.question"),
      answer: t("faqs.41.answer"),
    },
    {
      question: t("faqs.42.question"),
      answer: t("faqs.42.answer"),
    },
  ];

  // Filtrado de FAQs según el texto ingresado
  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return faqs;
    const query = search.toLowerCase();
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(query) ||
        f.answer.toLowerCase().includes(query),
    );
  }, [search, faqs]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-[800px]"
      title="Preguntas frecuentes"
    >
      <div className="mb-4 flex items-center gap-2">
        <FaSearch className="text-gray-500" />
        <InputField
          type="text"
          placeholder="Buscar pregunta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, idx) => <AccordionItem key={idx} {...faq} />)
        ) : (
          <Text className="text-center text-gray-500">
            No se encontraron resultados.
          </Text>
        )}
      </div>
    </Modal>
  );
}
