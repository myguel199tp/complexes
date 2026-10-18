"use client";

import { useId } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MdStar } from "react-icons/md";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { fileUrl } from "@/app/helpers/fileUrl";
import type { B2bServiceCategory } from "@/app/helpers/b2bServiceCategories";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** Pantallas de la administración. Espeja `B2bAdSlot` del backend. */
export type B2bAdSlotName = "b2b-catalog" | "maintenance" | "expenses";

interface ServedB2bAd {
  id: string;
  comercioId: string;
  comercioName: string | null;
  logoUrl: string | null;
  categoryLabel: string;
  title: string;
  body: string | null;
  imageFilename: string | null;
  sponsored: true;
}

async function call<T>(path: string, conjuntoId: string, init: RequestInit = {}) {
  const res = await fetchWithAuth(`${API_URL}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "x-conjunto-id": conjuntoId },
  });
  if (!res.ok) throw new Error(`Destacados: ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * Destacados B2B: proveedores que pagan por aparecer primero ante la
 * administración. Es otro producto que la publicidad para residentes
 * (`components/ads/ad-slot.tsx`) y no se mezclan: aquí solo hay proveedores
 * para el conjunto, y allá solo comercios para el residente.
 *
 * A quién le llega (solo la administración), cuántos y en qué planes lo decide
 * el servidor. Este componente solo dice en qué pantalla está y, en el
 * catálogo, qué categoría se está filtrando. Sin destacados no pinta nada.
 */
export function B2bAdSlot({
  slot,
  category,
  className,
}: {
  slot: B2bAdSlotName;
  category?: B2bServiceCategory | "";
  className?: string;
}) {
  const router = useRouter();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const instance = useId();

  // Una consulta por montaje (y por categoría en el catálogo), sin refetch:
  // cada una registra vistas que el comercio ve en sus resultados.
  const { data } = useQuery({
    queryKey: ["b2b-ads-serve", slot, category ?? "", conjuntoId, instance],
    queryFn: () => {
      const params = new URLSearchParams({ slot });
      if (category) params.set("category", category);
      return call<{ ads: ServedB2bAd[] }>(`/b2b-ads/serve?${params.toString()}`, String(conjuntoId));
    },
    enabled: !!conjuntoId,
    staleTime: Infinity,
    cacheTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const ads = data?.ads ?? [];
  if (ads.length === 0) return null;

  // A la ficha del proveedor en el catálogo, que es donde se le pide
  // cotización: lo que se mide como resultado del destacado.
  const open = (ad: ServedB2bAd) => {
    if (conjuntoId) call(`/b2b-ads/${ad.id}/click`, conjuntoId, { method: "POST" }).catch(() => {});
    const params = new URLSearchParams({ name: ad.comercioName ?? "" });
    router.push(`/my-b2b/${ad.comercioId}?${params.toString()}`);
  };

  return (
    <div className={className}>
      <div className="grid gap-3 sm:grid-cols-2">
        {ads.map((ad) => {
          const image = fileUrl(ad.imageFilename) ?? fileUrl(ad.logoUrl);
          return (
            <button
              key={ad.id}
              type="button"
              onClick={() => open(ad)}
              className="flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50/60 p-4 text-left shadow-sm transition hover:border-amber-400 dark:border-amber-300/30 dark:bg-amber-300/[0.06] dark:hover:border-amber-300/60"
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-300/10 dark:text-amber-300">
                  <MdStar size={22} />
                </span>
              )}
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-1 text-[11px] font-semibold tracking-wide text-amber-700 dark:text-amber-300">
                  <MdStar size={12} />
                  Patrocinado · {ad.categoryLabel}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {ad.title}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {ad.comercioName}
                  {ad.body ? ` — ${ad.body}` : ""}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
