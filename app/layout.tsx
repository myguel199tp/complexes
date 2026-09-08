import "./globals.css";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import { Providers } from "./providers";
import { ACCESS_COOKIE, REFRESH_COOKIE, verifyToken } from "./api/_lib/session";
import {
  OG_IMAGE,
  SITE_CONTACT_EMAIL,
  SITE_NAME,
  SITE_SAME_AS,
  SITE_TAGLINE,
  SITE_URL,
} from "./_domain/constants/site";

export const metadata: Metadata = {
  /**
   * Sin metadataBase, Next emite las URLs de Open Graph y los canonical en
   * relativo y ninguna red social resuelve la imagen. El resto del archivo se
   * escribe relativo y se absolutiza contra esta base.
   */
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    /**
     * Cada pantalla declara sólo su nombre ("Aliados", "Planes") y la marca la
     * añade esta plantilla. Así ningún título la repite dos veces ni se pasa
     * de los ~60 caracteres que Google alcanza a mostrar.
     */
    template: `%s | ${SITE_NAME}`,
  },

  description:
    "Plataforma para administrar conjuntos residenciales y propiedad horizontal: citofonía virtual, control de visitantes, cartera y facturación, asambleas con votación, comunicados, gestión documental y un marketplace de comercios aliados.",

  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "software",

  /*
   * A propósito no hay `alternates.canonical` aquí: la metadata del layout raíz
   * la heredan todas las pantallas, y un canonical "/" heredado le diría a
   * Google que cada landing es una copia de la portada. Cada pantalla pública
   * declara el suyo en su propio layout.
   */

  /**
   * max-image-preview:large habilita la miniatura grande en resultados y en
   * Discover; max-snippet:-1 deja que Google use el fragmento completo.
   */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  keywords: [
    "software para conjuntos residenciales",
    "administración de propiedad horizontal",
    "gestión de conjuntos residenciales",
    "citofonía virtual",
    "control de visitantes",
    "cartera y facturación de administración",
    "asambleas virtuales de copropietarios",
    "comunicados para residentes",
    "marketplace para conjuntos residenciales",
    "alquiler vacacional en copropiedades",
  ],

  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "es_CO",
    url: "/",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description:
      "Administra tu conjunto residencial desde un solo lugar: citofonía virtual, visitantes, cartera, asambleas, comunicados y marketplace de aliados.",
    images: [OG_IMAGE],
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description:
      "Administra tu conjunto residencial desde un solo lugar: citofonía virtual, visitantes, cartera, asambleas, comunicados y marketplace de aliados.",
    images: [OG_IMAGE.url],
  },

  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: "/icon.png",
  },

  /** Evita que iOS convierta cifras (cuotas, teléfonos) en enlaces azules. */
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
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

  /**
   * Un solo bloque JSON-LD con tres entidades enlazadas por @id, que es como
   * Google consolida una marca: la organización (panel de conocimiento), el
   * sitio y el producto de software con su oferta. Enlazarlas evita que se
   * lean como tres cosas sueltas sin relación entre sí.
   */
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/icon.png`,
        },
        description:
          "Plataforma de gestión para conjuntos residenciales y propiedad horizontal.",
        email: SITE_CONTACT_EMAIL,
        sameAs: SITE_SAME_AS,
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: SITE_CONTACT_EMAIL,
            availableLanguage: ["es", "en", "pt"],
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "es",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: SITE_NAME,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Property management software",
        operatingSystem: "Web, iOS, Android",
        url: SITE_URL,
        inLanguage: ["es", "en", "pt"],
        description:
          "Software para administrar conjuntos residenciales: citofonía virtual, control de visitantes, cartera, asambleas, comunicados, documentos y marketplace de comercios aliados.",
        featureList: [
          "Citofonía virtual",
          "Control y registro de visitantes",
          "Cartera y facturación de la administración",
          "Asambleas con votación ponderada",
          "Comunicados y cartelera digital",
          "Gestión documental de la copropiedad",
          "Reserva de zonas comunes y alquiler vacacional",
          "Marketplace de comercios aliados",
        ],
        offers: {
          "@type": "Offer",
          category: "SaaS",
          url: `${SITE_URL}/soluciones/planes`,
          availability: "https://schema.org/InStock",
        },
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <html lang="es" className="dark">
      <body className="w-full">
        {/*
          Corre antes del primer pintado para que quien eligió el tema claro no
          vea parpadear el panel oscuro mientras React hidrata. Va inline y no
          con <Script>, que se ejecuta después. Sin valor guardado queda "dark",
          que es lo que ve hoy todo el mundo.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("panel-theme");document.documentElement.classList.toggle("dark",t!=="light")}catch(e){}`,
          }}
        />

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
