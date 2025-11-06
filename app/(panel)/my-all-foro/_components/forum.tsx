"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ForumThread, getThreadsService } from "../services/getThreadsService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export default function Forum() {
  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";

  // Evitamos hacer la consulta si no hay conjuntoId
  const { data, isLoading, error } = useQuery({
    queryKey: ["threads", infoConjunto],
    queryFn: () => getThreadsService(infoConjunto),
    enabled: !!infoConjunto, // solo ejecuta si existe conjuntoId
  });

  if (isLoading) return <p>Cargando foros...</p>;
  if (error instanceof Error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Todos los Foros</h1>
      {data?.length ? (
        data.map((t: ForumThread) => (
          <Link key={t.id} href={`/my-all-foro/foroall/${t.id}`}>
            <div className="border p-2 rounded hover:bg-gray-200 cursor-pointer">
              {t.title}
            </div>
          </Link>
        ))
      ) : (
        <p>No hay foros disponibles.</p>
      )}
    </div>
  );
}
