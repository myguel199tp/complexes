/* eslint-disable @next/next/no-img-element */
"use client";

import { Title, Text, Button, Avatar } from "complexes-next-components";
import { useLiveNews } from "./newsAll-info";
import { voteNews } from "../service/eventService";
import { useLanguage } from "@/app/hooks/useLanguage";
import ModalAdmin from "./modal/modal";
import { useEffect, useState } from "react";
import MessageNotData from "@/app/components/messageNotData";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { useInfoQuery } from "../../my-vip/_components/use-info-query";
import { FcLike } from "react-icons/fc";
import { FcDislike } from "react-icons/fc";
import { useQueryClient } from "@tanstack/react-query";
import { NewsResponse } from "../../my-news/services/response/newsResponse";

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
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const router = useRouter();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const { data: fees = [] } = useInfoQuery() as { data: FeeItem[] };
  const [openModal, setOpenModal] = useState(false);

  const userRole = useConjuntoStore((state) => state.role);
  const nameUser = useConjuntoStore((state) => state.nameUser);
  const lastName = useConjuntoStore((state) => state.lastName);
  const conjuntoName = useConjuntoStore((state) => state.conjuntoName);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const safeFees = Array.isArray(fees) ? fees : [];

  const hasCurrentMonthFee = safeFees.some((item) =>
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

  const vote = async (
    newsId: string,
    type: "like" | "dislike",
  ): Promise<void> => {
    if (!BASE_URL) return;

    queryClient.setQueryData<NewsResponse[]>(
      ["news", conjuntoId],
      (oldData) => {
        if (!oldData) return oldData;

        return oldData.map((item) =>
          item.id === newsId
            ? {
                ...item,
                likes: type === "like" ? (item.likes ?? 0) + 1 : item.likes,
                dislikes:
                  type === "dislike" ? (item.dislikes ?? 0) + 1 : item.dislikes,
              }
            : item,
        );
      },
    );

    await voteNews(BASE_URL, newsId, type, conjuntoId);
  };

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
      <div className="fixed inset-0  flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-4xl mx-4 p-8 rounded-2xl bg-red-400 border text-center shadow-xl">
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
    <div className="w-full p-4 md:p-8  min-h-screen">
      {sortedData.length === 0 ? (
        <MessageNotData />
      ) : (
        <div
          className="
        columns-1
        sm:columns-2
        xl:columns-3
        2xl:columns-4
        gap-6
        space-y-6
      "
        >
          {sortedData.map((ele, index) => {
            const key = ele.id || `news-${index}`;

            const formattedDate = new Intl.DateTimeFormat(
              locales[language] || "es-CO",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              },
            ).format(new Date(ele.createdAt));

            const imageUrl = `${BASE_URL}/uploads/${ele.file?.replace(
              /^.*[\\/]/,
              "",
            )}`;

            return (
              <article
                key={key}
                className="
              break-inside-avoid
              overflow-hidden
              rounded-3xl
              bg-white
              shadow-lg
              border border-gray-200
              hover:shadow-2xl
              hover:-translate-y-1
              transition-all
              duration-300
              group
            "
              >
                <div className="relative overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={ele.title}
                    className="
                  w-full
                  object-cover
                  group-hover:scale-105
                  transition-transform
                  duration-500
                  h-[220px]
                  md:h-[280px]
                "
                  />

                  <div
                    className="
                  absolute inset-0
                  bg-gradient-to-t
                  from-black/70
                  via-black/10
                  to-transparent
                "
                  />

                  <div className="absolute top-4 left-4">
                    <span
                      className="
                    bg-white/20
                    backdrop-blur-md
                    px-3 py-1
                    rounded-full
                    text-xs
                    font-semibold
                    border border-white/20
                  "
                    >
                      {formattedDate}
                    </span>
                  </div>

                  {/* TITLE OVER IMAGE */}
                  <div className="absolute bottom-0 p-5">
                    <Title
                      size="sm"
                      font="bold"
                      className="text-white leading-tight"
                    >
                      {ele.title}
                    </Title>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <Text
                    size="sm"
                    className="
                  text-gray-600
                  leading-relaxed
                  line-clamp-5
                "
                  >
                    {ele.textmessage}
                  </Text>

                  {/* ACTIONS */}
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex gap-3">
                      <button
                        onClick={() => vote(ele.id, "like")}
                        className="
                      flex items-center gap-2
                      bg-green-50
                      hover:bg-green-100
                      px-4 py-2
                      rounded-xl
                      transition-all
                    "
                      >
                        <FcLike size={20} />
                        <span className="font-semibold text-sm">
                          {ele.likes ?? 0}
                        </span>
                      </button>

                      <button
                        onClick={() => vote(ele.id, "dislike")}
                        className="
                      flex items-center gap-2
                      bg-red-50
                      hover:bg-red-100
                      px-4 py-2
                      rounded-xl
                      transition-all
                    "
                      >
                        <FcDislike size={20} />
                        <span className="font-semibold text-sm">
                          {ele.dislikes ?? 0}
                        </span>
                      </button>
                    </div>

                    <div
                      className="
                    text-xs
                    text-gray-400
                    font-medium
                  "
                    >
                      SmartPH
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
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
