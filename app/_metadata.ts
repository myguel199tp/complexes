import { Metadata } from "next";

export const metadataApp: Metadata = {
  title: "Complexes - Gestión de Conjuntos Residenciales y Marketplace",
  applicationName: "Complexes web",
  description:
    "Complexes es una plataforma para conjuntos residenciales que mejora la comunicación, administración y la vida comunitaria. Conecta propietarios, residentes y prestadores de servicios con herramientas como citofonía virtual, gestión de eventos y un marketplace local.",
  keywords: [
    "gestión de conjuntos residenciales",
    "administración de propiedad horizontal",
    "arriendo y alquiler de inmuebles",
    "ventas de inmuebles",
    "marketplace residencial",
    "servicios para residentes",
    "comunicación con portería",
    "eventos y actividades residenciales",
    "comprar y vender en conjuntos residenciales",
    "administración de zonas comunes",
    "alquiler temporal de propiedades",
    "comunidad residencial",
  ],
  verification: { google: "google" },
  icons: { icon: "/favicon.ico" },
  openGraph: {
    description:
      "Complexes es una plataforma integral que conecta a propietarios, residentes y prestadores de servicios para facilitar la gestión de conjuntos residenciales.",
    url: "https://tusitio.com/complexes",
    siteName: "Complexes",
    locale: "es_CO",
    type: "website",
  },
};
