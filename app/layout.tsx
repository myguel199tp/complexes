import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import { Providers } from "./providers";
import { ACCESS_COOKIE, REFRESH_COOKIE, verifyToken } from "./api/_lib/session";

export const metadata: Metadata = {
  title: "globaliaph- Gestión de Conjuntos Residenciales",
  description:
    "Plataforma para la gestión de conjuntos residenciales que facilita la administración, la comunicación comunitaria y la economía local.",

  alternates: {
    languages: {
      es: "https://www.globaliaph.com/es",
      en: "https://www.globaliaph.com/en",
      pt: "https://www.globaliaph.com/pt",
      "x-default": "https://www.globaliaph.com/",
    },
  },

  keywords: [
    "gestión de conjuntos residenciales",
    "citofonía virtual",
    "marketplace local",
    "renta vacacional",
    "comunicados",
    "servicios para residentes",
    "registro de visitantes",
    "control de cartera",

    "residential complex management",
    "virtual intercom",
    "local marketplace",
    "vacation rental",
    "community announcements",
    "resident services",
    "visitor registration",
    "portfolio control",

    "gestão de condomínios residenciais",
    "interfone virtual",
    "mercado local",
    "aluguel de temporada",
    "avisos comunitários",
    "serviços para moradores",
    "registro de visitantes",
    "controle de portfólio",
  ],

  openGraph: {
    title: "globaliaph",
    description: "Plataforma para la gestión de conjuntos residenciales.",
    url: "https://globaliaph.com/complexes",
    siteName: "globaliaph",
    locale: "es_ES",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // La sesión se resuelve en el servidor, donde sí se pueden leer las cookies
  // httpOnly. El cliente recibe los claims, nunca el token.
  const cookieStore = cookies();
  const session =
    (await verifyToken(cookieStore.get(ACCESS_COOKIE)?.value)) ??
    (await verifyToken(cookieStore.get(REFRESH_COOKIE)?.value));

  // Widget del asistente (AI Assistant Engine). Solo se inyecta si las tres
  // variables estan definidas, asi no aparece en entornos sin configurar.
  const widgetSrc = process.env.NEXT_PUBLIC_ASSISTANT_WIDGET_SRC;
  const widgetTenant = process.env.NEXT_PUBLIC_ASSISTANT_TENANT;
  const widgetKey = process.env.NEXT_PUBLIC_ASSISTANT_KEY;

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "globaliaph",
    applicationCategory: "RealEstateApplication",
    operatingSystem: "All",
    url: "https://globaliaph.com/complexes",
    inLanguage: ["es", "en", "pt"],
    description:
      "Plataforma para la gestión de conjuntos residenciales que facilita la administración, la comunicación comunitaria y la economía local.",
    creator: {
      "@type": "Organization",
      name: "globaliaphWeb",
    },
  };

  return (
    <html lang="es">
      <body className="w-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <Providers session={session}>{children}</Providers>

        {widgetSrc && widgetTenant && widgetKey ? (
          <Script
            src={widgetSrc}
            data-tenant={widgetTenant}
            data-key={widgetKey}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
