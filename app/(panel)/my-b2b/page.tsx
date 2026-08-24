"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Title, Text } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  B2bComercio,
  getB2bComercios,
} from "./services/b2bAllianceService";
import { StarRating } from "./_components/star-rating";
import { B2bNav } from "./_components/b2b-nav";
import { fileUrl } from "@/app/helpers/fileUrl";

function resolveLogo(logoUrl?: string): string | null {
  if (!logoUrl) return null;
  if (/^https?:\/\//i.test(logoUrl)) return logoUrl;
  return fileUrl(logoUrl);
}

export default function MyB2bPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const { data: comercios, isLoading } = useQuery({
    queryKey: ["my_b2b_comercios", conjuntoId],
    queryFn: () => getB2bComercios(conjuntoId),
    enabled: !!conjuntoId,
  });

  return (
    <div className="w-full p-2">
      <Title size="sm" font="bold" className="text-white">
        Aliados B2B para tu conjunto
      </Title>
      <Text size="sm" className="text-slate-400 mt-1">
        Empresas que ofrecen servicios directamente al conjunto. Elige una para
        ver sus planes y solicitar una alianza.
      </Text>

      <B2bNav />

      {isLoading ? (
        <Text size="sm" className="text-slate-400 mt-6">Cargando...</Text>
      ) : comercios && comercios.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {comercios.map((c: B2bComercio) => {
            const logo = resolveLogo(c.logoUrl);
            return (
              <Link
                key={c.id}
                href={`/my-b2b/${c.id}`}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.08] transition flex flex-col"
              >
                <div className="flex items-center justify-center h-24 bg-white/5 rounded-md overflow-hidden">
                  {logo ? (
                    <img
                      src={logo}
                      alt={c.businessName}
                      className="max-h-24 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-cyan-300">
                      {c.businessName?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="mt-2 font-semibold text-slate-100">
                  {c.businessName}
                </span>
                <span className="mt-1">
                  <StarRating value={c.ratingAverage} count={c.ratingCount} />
                </span>
                {c.city ? (
                  <span className="text-slate-400 text-xs">
                    {c.city}
                    {c.country ? `, ${c.country}` : ""}
                  </span>
                ) : null}
                {c.description ? (
                  <span className="text-slate-500 text-xs mt-1 line-clamp-3">
                    {c.description}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : (
        <Text size="sm" className="text-slate-400 mt-6">
          Aún no hay comercios B2B disponibles.
        </Text>
      )}
    </div>
  );
}
