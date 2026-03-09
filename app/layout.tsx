// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SmartPH - Gestión de Conjuntos Residenciales",
  description:
    "Plataforma para la gestión de conjuntos residenciales que facilita la administración, la comunicación comunitaria y la economía local.",

  // 🌍 SEO Internacional (reemplaza <link rel="alternate">)
  alternates: {
    languages: {
      es: "https://tusitio.com/es",
      en: "https://tusitio.com/en",
      pt: "https://tusitio.com/pt",
      "x-default": "https://tusitio.com/es",
    },
  },

  // 📊 Keywords
  keywords: [
    // Español
    "gestión de conjuntos residenciales",
    "citofonía virtual",
    "marketplace local",
    "renta vacacional",
    "comunicados",
    "servicios para residentes",
    "registro de visitantes",
    "control de cartera",

    // Inglés
    "residential complex management",
    "virtual intercom",
    "local marketplace",
    "vacation rental",
    "community announcements",
    "resident services",
    "visitor registration",
    "portfolio control",

    // Portugués
    "gestão de condomínios residenciais",
    "interfone virtual",
    "mercado local",
    "aluguel de temporada",
    "avisos comunitários",
    "serviços para moradores",
    "registro de visitantes",
    "controle de portfólio",
  ],

  // OpenGraph (opcional pero recomendado)
  openGraph: {
    title: "SmartPH",
    description: "Plataforma para la gestión de conjuntos residenciales.",
    url: "https://tusitio.com/complexes",
    siteName: "SmartPH",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SmartPH",
    applicationCategory: "RealEstateApplication",
    operatingSystem: "All",
    url: "https://tusitio.com/complexes",
    inLanguage: ["es", "en", "pt"],
    description:
      "Plataforma para la gestión de conjuntos residenciales que facilita la administración, la comunicación comunitaria y la economía local.",
    creator: {
      "@type": "Organization",
      name: "SmartPH Web",
    },
  };

  return (
    <html lang="es">
      <body className="w-full">
        {/* 📊 JSON-LD correcto en App Router */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
