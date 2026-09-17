"use client";

import Link from "next/link";
import {
  audienceNote,
  benefitHeadline,
  deadlineNote,
  durationNote,
  scopeNote,
} from "./benefit-copy";
import { useShowcase } from "./use-showcase";

interface PromoBannerProps {
  /**
   * A dónde manda el botón. Sin esto lo decide la propia campaña: las
   * automáticas al cotizador, donde el descuento ya está aplicado, y las de
   * código a la demostración, que es donde se pide.
   */
  href?: string;
  ctaLabel?: string;
  className?: string;
}

/**
 * Banda de promociones vigentes para las páginas públicas.
 *
 * No renderiza nada cuando no hay campaña: sin promoción no debe ocupar
 * espacio ni mover el diseño de la página que la hospeda. Por lo mismo no
 * muestra estado de carga —un esqueleto que casi siempre desaparece es peor
 * que aparecer un instante después.
 */
export default function PromoBanner({
  href,
  ctaLabel,
  className = "",
}: PromoBannerProps) {
  const { campaigns } = useShowcase();

  if (!campaigns.length) return null;

  /**
   * Si alguna exige código, el botón lleva a la demostración: mandar al
   * cotizador a quien no tiene el código es mandarlo a ver el precio sin la
   * promoción que se le acaba de anunciar.
   */
  const needsCoupon = campaigns.some((campaign) => campaign.requiresCoupon);

  const linkHref =
    href ?? (needsCoupon ? "/soluciones/demost" : "/registers/complex");

  const linkLabel =
    ctaLabel ??
    (needsCoupon
      ? "Solicita tu código en una demostración"
      : "Ver planes con la promoción");

  return (
    <div className={`px-2 pt-2 sm:px-3 md:px-4 xl:px-6 ${className}`}>
      <div className="mx-auto w-full max-w-[1400px] overflow-hidden rounded-[20px] bg-gradient-to-r from-emerald-600 via-cyan-600 to-cyan-700 shadow-[0_10px_30px_rgba(6,182,212,.25)]">
        <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-7">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              Promoción activa
            </span>

            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-6">
              {campaigns.map((campaign) => {
                const duration = durationNote(campaign);
                const audience = audienceNote(campaign);
                const scope = scopeNote(campaign);
                const deadline = deadlineNote(campaign);

                return (
                  <div key={campaign.id} className="text-white">
                    <p className="text-lg font-extrabold leading-tight md:text-xl">
                      {benefitHeadline(campaign)}
                      {duration && (
                        <span className="text-sm font-semibold text-white/90">
                          {" "}
                          {duration}
                        </span>
                      )}
                    </p>

                    <p className="text-sm font-semibold text-white/95">
                      {campaign.name}
                    </p>

                    {campaign.description && (
                      <p className="mt-0.5 max-w-xl text-xs text-white/85">
                        {campaign.description}
                      </p>
                    )}

                    {(audience || scope || deadline) && (
                      <p className="mt-1 text-xs text-white/80">
                        {[audience, scope, deadline]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}

                    {/* El código no se publica: se anuncia que existe y dónde
                        pedirlo. Publicarlo la volvería automática. */}
                    {campaign.requiresCoupon && (
                      <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">
                        🎟️ Con código — pídelo al agendar tu demostración
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Link
            href={linkHref}
            className="w-fit shrink-0 rounded-full bg-white px-5 py-2.5 text-center text-sm font-bold text-cyan-800 transition-transform hover:-translate-y-0.5"
          >
            {linkLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
