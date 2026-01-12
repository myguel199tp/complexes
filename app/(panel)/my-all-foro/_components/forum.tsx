"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ForumThread, getThreadsService } from "../services/getThreadsService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { Text } from "complexes-next-components";
import MessageNotData from "@/app/components/messageNotData";
import { ImSpinner9 } from "react-icons/im";

export default function Forum() {
  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";

  // Evitamos hacer la consulta si no hay conjuntoId
  const { data, isLoading, error } = useQuery({
    queryKey: ["threads", infoConjunto],
    queryFn: () => getThreadsService(infoConjunto),
    enabled: !!infoConjunto, // solo ejecuta si existe conjuntoId
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );
  if (error instanceof Error) return <Text>Error: {error.message}</Text>;

  return (
    <div>
      {data?.length ? (
        data.map((t: ForumThread) => (
          <Link key={t.id} href={`/my-all-foro/foroall/${t.id}`}>
            <div className="border p-2 rounded hover:bg-gray-200 cursor-pointer">
              {t.title}
            </div>
          </Link>
        ))
      ) : (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      )}
    </div>
  );
}
