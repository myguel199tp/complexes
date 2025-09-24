// app/_metadata.ts
import { Metadata } from "next";

export const metadataByLang: Record<string, Metadata> = {
  es: {
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
    openGraph: {
      description:
        "Complexes es una plataforma integral que conecta a propietarios, residentes y prestadores de servicios para facilitar la gestión de conjuntos residenciales.",
      url: "https://tusitio.com/es",
      siteName: "Complexes",
      locale: "es_CO",
      type: "website",
    },
  },
  en: {
    title: "Complexes - Residential Complex Management and Marketplace",
    applicationName: "Complexes web",
    description:
      "Complexes is a platform for residential complexes that improves communication, management, and community life. It connects owners, residents, and service providers with tools such as virtual intercom, event management, and a local marketplace.",
    keywords: [
      "residential complex management",
      "property management",
      "rental and leasing of properties",
      "property sales",
      "residential marketplace",
      "resident services",
      "communication with front desk",
      "residential events and activities",
      "buying and selling in residential complexes",
      "common area management",
      "short-term rentals",
      "residential community",
    ],
    openGraph: {
      description:
        "Complexes is a comprehensive platform that connects owners, residents, and service providers to facilitate residential complex management.",
      url: "https://tusitio.com/en",
      siteName: "Complexes",
      locale: "en_US",
      type: "website",
    },
  },
  pt: {
    title: "Complexes - Gestão de Condomínios Residenciais e Marketplace",
    applicationName: "Complexes web",
    description:
      "Complexes é uma plataforma para condomínios residenciais que melhora a comunicação, a administração e a vida comunitária. Conecta proprietários, moradores e prestadores de serviços com ferramentas como interfone virtual, gestão de eventos e um marketplace local.",
    keywords: [
      "gestão de condomínios residenciais",
      "administração de propriedades",
      "aluguel e arrendamento de imóveis",
      "venda de imóveis",
      "marketplace residencial",
      "serviços para moradores",
      "comunicação com portaria",
      "eventos e atividades residenciais",
      "compra e venda em condomínios",
      "administração de áreas comuns",
      "aluguel de temporada",
      "comunidade residencial",
    ],
    openGraph: {
      description:
        "Complexes é uma plataforma completa que conecta proprietários, moradores e prestadores de serviços para facilitar a gestão de condomínios residenciais.",
      url: "https://tusitio.com/pt",
      siteName: "Complexes",
      locale: "pt_BR",
      type: "website",
    },
  },
};
