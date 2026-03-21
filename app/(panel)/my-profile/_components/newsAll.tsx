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
import { useInfoQuery } from "../../my-vip/_components/use-info-query";

interface AdminFee {
  amount: string;
  dueDate: string;
  type: string;
  description: string;
}

interface FeeItem {
  adminFees: AdminFee[];
}

export default function NewsAll() {
  const { data, error, BASE_URL } = useLiveNews();
  const { language } = useLanguage();
  const router = useRouter();

  const { data: fees = [] } = useInfoQuery() as { data: FeeItem[] };
  const [openModal, setOpenModal] = useState(false);

  const userRole = useConjuntoStore((state) => state.role);
  const nameUser = useConjuntoStore((state) => state.nameUser);
  const lastName = useConjuntoStore((state) => state.lastName);
  const conjuntoName = useConjuntoStore((state) => state.conjuntoName);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const hasCurrentMonthFee = fees.some((item) =>
    item.adminFees?.some((fee) => {
      const feeDate = new Date(fee.dueDate);

      return (
        feeDate.getMonth() === currentMonth &&
        feeDate.getFullYear() === currentYear
      );
    }),
  );
  useEffect(() => {
    if (!hasCurrentMonthFee && userRole === "owner") {
      setOpenModal(true);
    }
  }, [hasCurrentMonthFee, userRole]);
  useEffect(() => {
    if (error) {
      router.replace("/welcome");
    }
  }, [error, router]);

  if (!data && !error) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Text>Cargando información...</Text>
      </div>
    );
  }

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

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-4xl mx-4 p-8 rounded-2xl bg-slate-50 border text-center shadow-xl">
          <div className="flex justify-around my-6">
            <Avatar
              src={"/complex.jpg"}
              alt="complex"
              size="lg"
              border="none"
              shape="rounded"
            />

            <Title size="md" font="bold">
              Bienvenido a SmartPH {conjuntoName}
            </Title>

            <div className="bg-white/20 p-2 rounded-full cursor-pointer">
              <IoReturnDownBackOutline
                size={30}
                onClick={() => router.push(route.ensemble)}
              />
            </div>
          </div>

          <Text size="md" className="mb-3">
            Hola, {nameUser} {lastName} 👋
          </Text>

          {userRole === "employee" && (
            <>
              <Button
                className="w-full max-w-md mx-auto"
                colVariant="success"
                onClick={() => router.push(route.payComplexes)}
              >
                Activar mi acceso
              </Button>

              <Text size="xxs" className="font-semibold mt-4">
                {extractErrorMessage(error)}
              </Text>
            </>
          )}
        </div>
      </div>
    );
  }

  const safeData = Array.isArray(data) ? data : [];

  const locales: Record<string, string> = {
    es: "es-CO",
    en: "en-US",
    pt: "pt-BR",
  };

  const sortedData = [...safeData].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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
            },
          ).format(new Date(ele.createdAt));

          return (
            <div
              key={key}
              className="w-full flex flex-col md:flex-row gap-5 p-5 m-2 border rounded-md bg-white"
            >
              <img
                className="rounded-lg w-full h-80 md:w-[400px] md:h-[300px] object-cover"
                alt={ele.title}
                src={`${BASE_URL}/uploads/${ele.file?.replace(/^.*[\\/]/, "")}`}
              />

              <div className="flex flex-col w-full p-2">
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

      {!hasCurrentMonthFee && userRole === "owner" && (
        <ModalAdmin
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          nameUser={nameUser}
          lastName={lastName}
        />
      )}
    </div>
  );
}
