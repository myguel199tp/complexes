"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MdCampaign, MdClose, MdChevronRight } from "react-icons/md";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { route } from "@/app/_domain/constants/routes";
import { fileUrl } from "@/app/helpers/fileUrl";
import { getActiveBranches } from "@/app/(panel)/my-store/services/comercioStoreService";

import {
  AdSlotName,
  AdvertiserCard,
  ServedAd,
  getAdvertiser,
  registerAdClick,
  serveAds,
} from "./ads-service";

/**
 * Publicidad pagada de comercios, dentro de una pantalla del residente. Es el
 * mismo componente que tiene el móvil (`cmplx/components/ads/AdSlot.tsx`).
 *
 * Solo decide dónde está y cuántos caben: **el formato, la cantidad y a quién
 * le llega los decide el servidor** con el plan del conjunto y el rol de la
 * persona en él (la administración y el personal no reciben). Si el cliente
 * filtrara por su cuenta, la web y el móvil terminarían diciendo cosas
 * distintas.
 *
 * Nunca rompe la pantalla que lo hospeda: sin anuncios, sin red o con error,
 * no pinta nada.
 */
export function AdSlot({
  slot,
  limit,
  className,
}: {
  slot: AdSlotName;
  limit?: number;
  className?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  // Cada AdSlot es su propia consulta, aunque dos compartan espacio.
  const instance = useId();

  const [dismissed, setDismissed] = useState<string[]>([]);
  const [advertiserOf, setAdvertiserOf] = useState<ServedAd | null>(null);

  const enabled = !!conjuntoId;

  // Cada consulta cobra una impresión, así que se pide una sola vez por
  // montaje: sin refetch por foco, red o tiempo, y sin caché que la reviva al
  // volver a la pantalla (eso sí es mirarla otra vez, y se cuenta).
  const { data } = useQuery({
    queryKey: ["ads-serve", slot, conjuntoId, instance],
    queryFn: () => serveAds(String(conjuntoId), slot, limit),
    enabled,
    staleTime: Infinity,
    cacheTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const visible = (data?.ads ?? []).filter((ad) => !dismissed.includes(ad.id));

  async function open(ad: ServedAd) {
    if (!conjuntoId) return;
    registerAdClick(ad.id, conjuntoId).catch(() => {});

    // El comercio no está suscrito aquí: su tienda no aparece en este
    // conjunto. Se muestra la ficha.
    if (ad.shoppable === false) {
      setAdvertiserOf(ad);
      return;
    }

    // Un anuncio de "todo el comercio" no trae sucursal: se busca la que
    // atiende a este conjunto en la misma lista de la vitrina.
    let branchId = ad.branchId;
    if (!branchId) {
      const branches = await queryClient
        .fetchQuery({
          queryKey: ["store-branches", conjuntoId],
          queryFn: () => getActiveBranches(conjuntoId),
        })
        .catch(() => []);
      branchId = branches.find((b) => b.comercio?.id === ad.comercioId)?.id ?? null;
    }

    router.push(branchId ? `${route.storeComercio}/${branchId}` : route.myStore);
  }

  const dismiss = (id: string) => setDismissed((prev) => [...prev, id]);

  if (!enabled || (visible.length === 0 && !advertiserOf)) return null;

  return (
    <div className={className}>
      <div className="flex flex-col gap-3">
        {visible.map((ad) =>
          ad.format === "INTERSTITIAL" ? (
            <AdInterstitial key={ad.id} ad={ad} onOpen={open} onDismiss={dismiss} />
          ) : ad.format === "BANNER" ? (
            <AdBanner key={ad.id} ad={ad} onOpen={open} />
          ) : (
            <AdFeedCard key={ad.id} ad={ad} onOpen={open} />
          ),
        )}
      </div>

      {advertiserOf && conjuntoId && (
        <AdvertiserDialog
          ad={advertiserOf}
          conjuntoId={conjuntoId}
          onClose={() => setAdvertiserOf(null)}
        />
      )}
    </div>
  );
}

/**
 * La marca de patrocinado. Va en los tres formatos y no es configurable: un
 * anuncio que se lee como contenido del conjunto usa la confianza del
 * administrador para vender.
 */
function SponsoredTag({ name }: { name: string | null }) {
  return (
    <span className="flex items-center gap-1 text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">
      <MdCampaign size={13} />
      Patrocinado{name ? ` · ${name}` : ""}
    </span>
  );
}

/** Tarjeta dentro de la lista. Se va con el scroll; no interrumpe. */
function AdFeedCard({ ad, onOpen }: { ad: ServedAd; onOpen: (ad: ServedAd) => void }) {
  const image = fileUrl(ad.imageFilename);

  return (
    <button
      type="button"
      onClick={() => onOpen(ad)}
      className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-cyan-400/60 dark:border-white/10 dark:bg-white/[0.04]"
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-36 w-full object-cover" />
      )}
      <div className="flex flex-col gap-1 p-3">
        <SponsoredTag name={ad.comercioName} />
        <span className="text-base font-bold text-slate-900 dark:text-slate-100">
          {ad.title}
        </span>
        {ad.body && (
          <span className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
            {ad.body}
          </span>
        )}
        {ad.ctaLabel && (
          <span className="mt-1 text-sm font-bold text-cyan-700 dark:text-cyan-300">
            {ad.ctaLabel} →
          </span>
        )}
      </div>
    </button>
  );
}

/** Franja. Ocupa espacio, no lo tapa. */
function AdBanner({ ad, onOpen }: { ad: ServedAd; onOpen: (ad: ServedAd) => void }) {
  const image = fileUrl(ad.imageFilename);

  return (
    <button
      type="button"
      onClick={() => onOpen(ad)}
      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 text-left shadow-sm transition hover:border-cyan-400/60 dark:border-white/10 dark:bg-white/[0.04]"
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
      ) : (
        <span className="h-14 w-14 shrink-0 rounded-lg bg-slate-100 dark:bg-white/10" />
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <SponsoredTag name={ad.comercioName} />
        <span className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          {ad.title}
        </span>
      </span>
      <MdChevronRight size={22} className="shrink-0 text-slate-400" />
    </button>
  );
}

/**
 * Pantalla completa. Solo la reciben los conjuntos del plan básico. El cerrar
 * se ve desde el primer instante: un anuncio que esconde su salida es lo que
 * hace que la gente odie la app, y aquí el residente no eligió ver publicidad.
 */
function AdInterstitial({
  ad,
  onOpen,
  onDismiss,
}: {
  ad: ServedAd;
  onOpen: (ad: ServedAd) => void;
  onDismiss: (id: string) => void;
}) {
  const image = fileUrl(ad.imageFilename);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 p-4"
      onClick={() => onDismiss(ad.id)}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onDismiss(ad.id)}
          aria-label="Cerrar anuncio"
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 text-slate-900 shadow"
        >
          <MdClose size={20} />
        </button>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-48 w-full object-cover" />
        )}
        <div className="flex flex-col gap-2 p-5">
          <SponsoredTag name={ad.comercioName} />
          <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            {ad.title}
          </span>
          {ad.body && (
            <span className="text-sm text-slate-600 dark:text-slate-300">{ad.body}</span>
          )}
          <button
            type="button"
            onClick={() => {
              onDismiss(ad.id);
              onOpen(ad);
            }}
            className="mt-2 rounded-xl bg-cyan-600 py-3 text-sm font-bold text-white hover:bg-cyan-700"
          >
            {ad.ctaLabel ?? "Ver el comercio"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Ficha del comercio para quien vio su anuncio en un conjunto donde el
 * comercio no está suscrito: no puede comprarle desde aquí, así que se le
 * dice quién es y dónde queda. Sin teléfono: el servidor no lo manda, para
 * que el anuncio no reemplace a la suscripción.
 */
function AdvertiserDialog({
  ad,
  conjuntoId,
  onClose,
}: {
  ad: ServedAd;
  conjuntoId: string;
  onClose: () => void;
}) {
  const { data: card, isError } = useQuery<AdvertiserCard>({
    queryKey: ["ads-advertiser", ad.id],
    queryFn: () => getAdvertiser(ad.id, conjuntoId),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logo = fileUrl(card?.logoUrl);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
        >
          <MdClose size={20} />
        </button>

        <SponsoredTag name={ad.comercioName} />

        {isError ? (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            No pudimos cargar los datos del comercio.
          </p>
        ) : !card ? (
          <p className="mt-4 text-sm text-slate-500">Cargando...</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="" className="h-12 w-12 rounded-lg object-cover" />
              )}
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {card.name ?? ad.comercioName}
              </span>
            </div>

            {card.description && (
              <p className="text-sm text-slate-600 dark:text-slate-300">{card.description}</p>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Este comercio todavía no atiende pedidos en tu conjunto desde la app.
              Puedes visitarlo en su sede; cuando se suscriba a tu conjunto podrás
              pedirle desde aquí.
            </p>

            {card.branches.map((branch) => (
              <div
                key={branch.id}
                className="flex flex-col gap-1 rounded-xl border border-slate-200 p-3 dark:border-white/10"
              >
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {branch.name}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {branch.address}
                  {branch.neighborhood ? ` · ${branch.neighborhood}` : ""} ·{" "}
                  {branch.cityName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
