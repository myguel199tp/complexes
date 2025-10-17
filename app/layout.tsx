// app/layout.tsx
import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Complexes - Gestión de Conjuntos Residenciales",
  description:
    "Plataforma para la gestión de conjuntos residenciales que facilita la administración, la comunicación comunitaria y la economía local.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* 🌍 SEO Internacional con hrefLang */}
        <link rel="alternate" href="https://tusitio.com/es" hrefLang="es" />
        <link rel="alternate" href="https://tusitio.com/en" hrefLang="en" />
        <link rel="alternate" href="https://tusitio.com/pt" hrefLang="pt" />
        <link
          rel="alternate"
          href="https://tusitio.com/es"
          hrefLang="x-default"
        />

        {/* 📊 Schema.org con multilenguaje */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Complexes",
              applicationCategory: "RealEstateApplication",
              operatingSystem: "All",
              url: "https://tusitio.com/complexes",
              inLanguage: ["es", "en", "pt"],
              description:
                "Plataforma para la gestión de conjuntos residenciales que facilita la administración, la comunicación comunitaria y la economía local.",
              keywords: [
                // Español
                "gestión de conjuntos residenciales",
                "citofonía virtual",
                "marketplace local",
                "renta vacacional",
                "comunicados",
                "servicios para residentes",
                "registro de visitantes",
                "Control de cartera",
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
              creator: {
                "@type": "Organization",
                name: "Complexes Web",
              },
            }),
          }}
        />
      </head>
      <body className="w-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
