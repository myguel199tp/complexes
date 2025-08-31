// plan-features.ts

export type PlanFeature = {
  text: string;
  tooltip?: string; // 👈 opcional
  tachado?: boolean; // 👈 opcional
};

export const planFeatures: Record<
  "basic" | "gold" | "platinum",
  PlanFeature[]
> = {
  basic: [
    {
      text: "Citofonía Virtual",
      tooltip:
        "Permite comunicación directa entre portería y residentes solo en el chat de la plataforma.",
    },
    {
      text: "Registro de 1 subusuario",
      tooltip: "Posibilidad de añadir un usuario adicional a la plataforma.",
    },
    {
      text: "Avisos y Comunicados",
      tachado: true,
      tooltip: "Disponible desde plan Gold.",
    },
    {
      text: "Gestión para Actividades",
      tooltip:
        "Reserva y administra espacios comunes como salón social, cancha, piscinas entre otros.",
    },
    {
      text: "Registro de visitantes",
      tooltip: "Control digital de visitantes que ingresan al conjunto.",
    },
    {
      text: "Registro de residentes",
      tooltip: "Mantén actualizado el listado de residentes.",
    },
    {
      text: "Venta y arriendo 1 inmueble",
      tooltip: "Permite publicar hasta 1 inmueble para venta o arriendo..",
    },
    {
      text: "Alquiler vacacional 1 inmueble",
      tooltip: "Publica hasta un inmueble para alquiler vacacional.",
    },
    {
      text: "Página de noticias",
      tooltip: "Comparte noticias relevantes dentro de la comunidad.",
    },
    {
      text: "Marketplace de Productos y Servicios",
      tachado: true,
      tooltip: "Disponible desde plan Gold.",
    },
    {
      text: "Sistema de contabilidad",
      tachado: true,
      tooltip: "Incluido en plan Gold o superior.",
    },
    {
      text: "Foro de discusión",
      tachado: true,
      tooltip: "Disponible únicamente en plan Platinum.",
    },
    {
      text: "Registro de documentos",
      tachado: true,
      tooltip: "Disponible desde plan Gold.",
    },
  ],

  gold: [
    {
      text: "Citofonía Virtual (Whatsapp)",
      tooltip:
        "Permite comunicación directa entre portería y residentes vía WhatsApp.",
    },
    {
      text: "Registro de 2 subusuarios",
      tooltip:
        "Posibilidad de añadir hasta dos usuarios adicionales a la plataforma.",
    },
    {
      text: "Avisos y Comunicados",
      tooltip:
        "Envía avisos importantes a todos los residentes de manera digital.",
    },
    {
      text: "Gestión para Actividades",
      tooltip:
        "Reserva y administra espacios comunes como salón social o cancha.",
    },
    {
      text: "Registro de visitantes",
      tooltip: "Control digital de visitantes que ingresan al conjunto.",
    },
    {
      text: "Registro de residentes",
      tooltip: "Mantén actualizado el listado de residentes.",
    },
    {
      text: "Venta y arriendo 1 inmueble",
      tooltip: "Permite publicar hasta 1 inmueble para venta o arriendo.",
    },
    {
      text: "Alquiler vacacional 3 inmuebles",
      tooltip: "Publica hasta 3 inmuebles para alquiler vacacional.",
    },
    {
      text: "Página de noticias",
      tooltip: "Comparte noticias relevantes dentro de la comunidad.",
    },
    {
      text: "Marketplace de Productos y Servicios",
      tooltip:
        "Acceso al marketplace donde residentes pueden comprar y vender productos o servicios.",
    },
    {
      text: "Sistema de contabilidad",
      tooltip: "Gestión básica de ingresos y egresos del conjunto.",
    },
    {
      text: "Foro de discusión",
      tachado: true,
      tooltip: "Disponible únicamente en plan Platinum.",
    },
    {
      text: "Registro de documentos",
      tooltip: "Carga y consulta de documentos comunitarios.",
    },
  ],

  platinum: [
    {
      text: "Citofonía Virtual (Whatsapp)",
      tooltip:
        "Permite comunicación directa entre portería y residentes vía WhatsApp.",
    },
    {
      text: "Registro de 4 subusuarios",
      tooltip:
        "Posibilidad de añadir hasta cuatro usuarios adicionales a la plataforma.",
    },
    {
      text: "Avisos y Comunicados",
      tooltip:
        "Envía avisos importantes a todos los residentes de manera digital.",
    },
    {
      text: "Gestión para Actividades",
      tooltip:
        "Reserva y administra espacios comunes como salón social o cancha.",
    },
    {
      text: "Registro de visitantes",
      tooltip: "Control digital de visitantes que ingresan al conjunto.",
    },
    {
      text: "Registro de residentes",
      tooltip: "Mantén actualizado el listado de residentes.",
    },
    {
      text: "Venta y arriendo 3 inmuebles",
      tooltip: "Permite publicar hasta 3 inmuebles para venta o arriendo.",
    },
    {
      text: "Alquiler vacacional 5 inmuebles",
      tooltip: "Publica hasta 5 inmuebles para alquiler vacacional.",
    },
    {
      text: "Página de noticias",
      tooltip: "Comparte noticias relevantes dentro de la comunidad.",
    },
    {
      text: "Marketplace de Productos y Servicios",
      tooltip:
        "Acceso al marketplace donde residentes pueden comprar y vender productos o servicios.",
    },
    {
      text: "Sistema de contabilidad",
      tooltip: "Gestión completa de ingresos y egresos del conjunto.",
    },
    {
      text: "Foro de discusión",
      tooltip:
        "Espacio digital para debates, ideas y participación comunitaria.",
    },
    {
      text: "Registro de documentos",
      tooltip: "Carga y consulta de documentos comunitarios.",
    },
  ],
};
