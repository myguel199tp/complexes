import type { MetadataRoute } from "next";
import { SITE_URL } from "./_domain/constants/site";

/**
 * Se sirve en /robots.txt. Todo lo que exige sesión queda fuera del rastreo:
 * no aporta nada a la búsqueda, y dejarlo abierto gasta presupuesto de rastreo
 * en URLs que siempre responden con una redirección al login.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          // Panel del residente y de la administración (app/(panel)).
          "/my-",
          "/ensemble",
          "/holiday",
          // Paneles con autenticación propia.
          "/comercio/",
          "/delivery/",
          // Autenticación, registro y flujos transaccionales (app/(sets)).
          "/auth",
          "/users",
          "/registers/",
          "/activate-account",
          "/verify-otp",
          "/resert-password",
          "/return-password",
          "/pay-complexes",
          "/booking",
          "/signature",
          "/welcome",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
