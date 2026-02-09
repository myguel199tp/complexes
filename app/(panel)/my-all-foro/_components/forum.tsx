"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ForumThread, getThreadsService } from "../services/getThreadsService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { Text } from "complexes-next-components";
import MessageNotData from "@/app/components/messageNotData";
import { ImSpinner9 } from "react-icons/im";
import { FaChevronRight } from "react-icons/fa";

export default function Forum() {
  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["threads", infoConjunto],
    queryFn: () => getThreadsService(infoConjunto),
    enabled: !!infoConjunto,
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-700" size={42} />
      </div>
    );

  if (error instanceof Error)
    return <Text className="text-red-600">Error: {error.message}</Text>;

  return (
    <div className="mt-6 space-y-3">
      {data?.length ? (
        data.map((t: ForumThread) => (
          <Link key={t.id} href={`/my-all-foro/foroall/${t.id}`}>
            <div
              className="
                group flex items-center justify-between
                rounded-xl border border-gray-200 bg-white
                px-5 py-4 shadow-sm
                transition-all duration-200
                hover:border-cyan-500 hover:shadow-md
                cursor-pointer
              "
            >
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-cyan-700">
                  {t.title}
                </h3>
                <p className="text-xs text-gray-500">
                  Ver conversación completa
                </p>
              </div>

              <FaChevronRight
                className="text-gray-400 group-hover:text-cyan-600 transition"
                size={14}
              />
            </div>
          </Link>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <MessageNotData />
          <p className="mt-2 text-sm">Aún no hay temas creados</p>
        </div>
      )}
    </div>
  );
}
