// app/layout.tsx
import "./globals.css";
import { metadataApp } from "./_metadata";
import { Providers } from "./providers";

export const metadata = metadataApp;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
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
              description:
                "Plataforma para la gestión de conjuntos residenciales que facilita la administración, la comunicación comunitaria y la economía local.",
              keywords: [
                "gestión de conjuntos residenciales",
                "citofonía virtual",
                "marketplace local",
                "renta vacacional",
                "comunicados",
                "servicios para residentes",
              ],
              creator: {
                "@type": "Organization",
                name: "Complexes Web",
              },
            }),
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
