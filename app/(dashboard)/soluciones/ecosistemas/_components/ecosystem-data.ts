/**
 * Guión de la página "Modelo ecosistema globaliaph".
 *
 * La página no vende módulos —para eso está /us/platform— sino la tesis que
 * los sostiene: el conjunto no es un cliente aislado al que se le instala un
 * software, es el punto donde se cruzan cinco actores que ya hacían negocios
 * entre ellos por WhatsApp, Excel y papelitos en portería. La plataforma solo
 * pone esas relaciones en un mismo sitio, y ahí aparece el valor que ninguno
 * de los cinco podía darse solo.
 *
 * El texto vive aquí y no dentro del JSX porque es contenido de mercadeo: se
 * reescribe a menudo y conviene poder cambiarlo sin tocar el render.
 *
 * Cada circuito, paso y etapa declara a qué actores les habla (`actores`): así
 * la página entera puede leerse desde el punto de vista del actor que el
 * visitante elija en el mapa.
 */

import {
  FaBuilding,
  FaBullhorn,
  FaHome,
  FaKey,
  FaMoneyBillWave,
  FaShieldAlt,
  FaStore,
  FaUsers,
} from "react-icons/fa";
import type { IconType } from "react-icons";
import { route } from "@/app/_domain/constants/routes";

export type ActorId =
  | "residentes"
  | "administracion"
  | "comercios"
  | "porteria"
  | "propietarios";

export interface Actor {
  id: ActorId;
  /** Nombre corto: es lo que cabe en el nodo del mapa. */
  nombre: string;
  /** Una línea que lo ubica, para la tarjeta de detalle. */
  rol: string;
  icon: IconType;
  /** Clases de color del nodo: cada actor tiene su tono en el mapa. */
  accent: {
    ring: string;
    text: string;
    glow: string;
    line: string;
    /** Punto de los pasos del circuito que protagoniza este actor. */
    dot: string;
  };
  /** Lo que ese actor pone en el ecosistema. */
  aporta: string;
  /** Lo que se lleva por estar dentro. */
  recibe: string;
  /** Módulos reales que lo tocan a diario. */
  modulos: string[];
  /** Cierre de la página cuando el visitante mira desde este actor. */
  cta: { texto: string; href: string };
}

export const ACTORS: Actor[] = [
  {
    id: "residentes",
    nombre: "Residentes",
    rol: "Las familias que viven el conjunto todos los días",
    icon: FaHome,
    accent: {
      ring: "border-cyan-400/60",
      text: "text-cyan-300",
      glow: "shadow-[0_0_40px_-12px_rgba(34,211,238,0.8)]",
      line: "stroke-cyan-400",
      dot: "bg-cyan-400",
    },
    aporta:
      "La cuota que sostiene al conjunto, el voto en las decisiones y el consumo diario que le da sentido comercial a la red.",
    recibe:
      "Dejan de depender del citófono, del grupo de WhatsApp y de bajar a portería: reservan, votan, piden y abren la puerta desde el celular.",
    modulos: [
      "Citofonía virtual",
      "Pago de cuotas en línea",
      "Reserva de zonas comunes",
      "Pases de acceso",
      "Domicilios con QR",
      "Foro y comunicados",
    ],
    cta: { texto: "Recomiéndalo a tu administración", href: route.demost },
  },
  {
    id: "administracion",
    nombre: "Administración",
    rol: "Administrador y consejo: quienes responden por la plata y las reglas",
    icon: FaBuilding,
    accent: {
      ring: "border-indigo-400/60",
      text: "text-indigo-300",
      glow: "shadow-[0_0_40px_-12px_rgba(129,140,248,0.8)]",
      line: "stroke-indigo-400",
      dot: "bg-indigo-400",
    },
    aporta:
      "El presupuesto, los contratos y las decisiones. Es el actor que convierte la plata de todos en servicios para todos.",
    recibe:
      "La información deja de estar en cuatro Excel y tres chats: cartera, gastos, contratos y actas quedan consultables y con trazabilidad.",
    modulos: [
      "Control de cartera",
      "Presupuesto y gastos",
      "Contratos",
      "Asamblea y votaciones",
      "PQR",
      "Gestión documental",
      "Paz y salvo",
    ],
    cta: { texto: "Agendar la demostración", href: route.demost },
  },
  {
    id: "comercios",
    nombre: "Comercios aliados",
    rol: "Proveedores y negocios de barrio, por dos vías distintas",
    icon: FaStore,
    accent: {
      ring: "border-emerald-400/60",
      text: "text-emerald-300",
      glow: "shadow-[0_0_40px_-12px_rgba(52,211,153,0.8)]",
      line: "stroke-emerald-400",
      dot: "bg-emerald-400",
    },
    aporta:
      "Aseo, jardinería, mantenimiento y seguridad para el conjunto (B2B); catálogo, pedidos y entregas para las familias (B2C).",
    recibe:
      "Un canal directo a cientos de hogares a pocas cuadras y contratos recurrentes con la administración, con reputación por estrellas que los demás conjuntos ven.",
    modulos: [
      "Alianzas B2B",
      "Catálogo B2C",
      "Marketplace",
      "Calificación por estrellas",
      "QR de entrega",
      "Pago a cuenta verificada",
    ],
    cta: { texto: "Tengo un comercio y quiero entrar", href: route.comercios },
  },
  {
    id: "porteria",
    nombre: "Portería y personal",
    rol: "Quienes sostienen la operación en el día a día",
    icon: FaShieldAlt,
    accent: {
      ring: "border-amber-400/60",
      text: "text-amber-300",
      glow: "shadow-[0_0_40px_-12px_rgba(251,191,36,0.8)]",
      line: "stroke-amber-400",
      dot: "bg-amber-400",
    },
    aporta:
      "El control de quién entra y quién sale, y la ejecución de lo que se acordó arriba: turnos, rondas, mantenimiento.",
    recibe:
      "Menos llamadas al apartamento y menos minuta a mano: el visitante, el domiciliario y el residente llegan ya identificados.",
    modulos: [
      "Registro de visitantes",
      "Escaneo de QR",
      "Parqueaderos",
      "Turnos del personal",
      "Cámaras",
      "Emergencias y evacuación",
    ],
    cta: { texto: "Agendar la demostración", href: route.demost },
  },
  {
    id: "propietarios",
    nombre: "Propietarios",
    rol: "Dueños que arriendan, venden o rentan por temporadas",
    icon: FaKey,
    accent: {
      ring: "border-fuchsia-400/60",
      text: "text-fuchsia-300",
      glow: "shadow-[0_0_40px_-12px_rgba(232,121,249,0.8)]",
      line: "stroke-fuchsia-400",
      dot: "bg-fuchsia-400",
    },
    aporta:
      "Los inmuebles que se mueven: los que se arriendan, los que se venden y los que se rentan por días.",
    recibe:
      "Publican dentro de una comunidad que ya está verificada, en lugar de exponer el inmueble a cualquiera en un portal abierto.",
    modulos: [
      "Arrienda o vende",
      "Alquiler vacacional",
      "Resumen de inmuebles",
      "Paz y salvo del inmueble",
    ],
    cta: { texto: "Ver inmuebles publicados", href: route.immovables },
  },
];

export interface Circuito {
  id: string;
  titulo: string;
  icon: IconType;
  /** Actores por los que pasa: define a quién le habla el circuito. */
  actores: ActorId[];
  /** El recorrido completo; cada paso dice qué actores lo protagonizan. */
  pasos: { texto: string; actores: ActorId[] }[];
  /** Por qué ese circuito solo cierra si están todos dentro. */
  cierre: string;
}

/**
 * Los cuatro circuitos por donde circula el valor. Son la prueba de la tesis:
 * ninguno se puede recorrer entero si falta uno de los actores.
 */
export const CIRCUITOS: Circuito[] = [
  {
    id: "plata",
    titulo: "El circuito de la plata",
    icon: FaMoneyBillWave,
    actores: ["residentes", "administracion", "comercios"],
    pasos: [
      { texto: "El residente paga en línea", actores: ["residentes"] },
      { texto: "Entra a cartera sin digitación", actores: ["administracion"] },
      {
        texto: "La administración contrata al proveedor",
        actores: ["administracion"],
      },
      { texto: "El comercio cobra y queda calificado", actores: ["comercios"] },
    ],
    cierre:
      "La misma cuota que antes se perseguía por WhatsApp termina pagando un contrato con vigencia y responsable. El recorrido queda registrado de punta a punta.",
  },
  {
    id: "seguridad",
    titulo: "El circuito de la confianza",
    icon: FaShieldAlt,
    actores: ["residentes", "porteria", "comercios"],
    pasos: [
      { texto: "El residente autoriza la visita", actores: ["residentes"] },
      { texto: "Se genera el QR", actores: ["residentes", "comercios"] },
      { texto: "Portería escanea y abre", actores: ["porteria"] },
      {
        texto: "Queda registro de hora y persona",
        actores: ["porteria", "administracion"],
      },
    ],
    cierre:
      "Nadie llama al apartamento para preguntar si puede subir. El domiciliario del comercio aliado entra por el mismo camino que la visita de la familia.",
  },
  {
    id: "comunicacion",
    titulo: "El circuito de las decisiones",
    icon: FaBullhorn,
    actores: ["administracion", "residentes", "propietarios"],
    pasos: [
      { texto: "El consejo publica el tema", actores: ["administracion"] },
      {
        texto: "Los residentes debaten en el foro",
        actores: ["residentes", "propietarios"],
      },
      {
        texto: "Se vota en asamblea",
        actores: ["residentes", "propietarios", "administracion"],
      },
      { texto: "El acta se firma y se archiva", actores: ["administracion"] },
    ],
    cierre:
      "La decisión no se pierde en un grupo de chat: nace, se discute, se vota y queda como documento consultable el año entrante.",
  },
  {
    id: "comunidad",
    titulo: "El circuito de la comunidad",
    icon: FaUsers,
    actores: ["residentes", "propietarios", "comercios"],
    pasos: [
      {
        texto: "El vecino publica o reserva",
        actores: ["residentes", "propietarios"],
      },
      { texto: "La comunidad responde", actores: ["residentes"] },
      { texto: "El comercio cercano atiende", actores: ["comercios"] },
      { texto: "El conjunto gana actividad", actores: ["administracion"] },
    ],
    cierre:
      "Zonas comunes, marketplace, arriendos y comercios aliados hacen que la app se abra por gusto y no solo cuando toca pagar.",
  },
];

export interface Etapa {
  numero: string;
  titulo: string;
  texto: string;
  /** Actores que protagonizan esa etapa del crecimiento. */
  actores: ActorId[];
}

/**
 * Por qué esto es un ecosistema y no una suma de licencias: el valor que
 * recibe cada conjunto crece con los conjuntos que ya están dentro.
 */
export const ETAPAS: Etapa[] = [
  {
    numero: "01",
    titulo: "Entra el conjunto",
    texto:
      "Se cargan unidades y residentes —migrando el Excel que ya existe— y la administración empieza a operar con cartera, comunicados y documentos en un solo lugar.",
    actores: ["administracion"],
  },
  {
    numero: "02",
    titulo: "Se suman los residentes",
    texto:
      "Cuando el pago, la reserva y la citofonía viven en la app, la familia entra sola. Ahí el conjunto deja de ser una base de datos y pasa a ser una audiencia.",
    actores: ["residentes", "propietarios", "porteria"],
  },
  {
    numero: "03",
    titulo: "Se conectan los comercios",
    texto:
      "Esa audiencia es lo que el negocio de barrio nunca pudo alcanzar sin pagarle comisión a una app de domicilios. Y la administración, por fin, encuentra proveedores con antecedentes verificables.",
    actores: ["comercios", "administracion"],
  },
  {
    numero: "04",
    titulo: "La red se vuelve el activo",
    texto:
      "Un proveedor calificado en un conjunto llega recomendado al siguiente. Cada conjunto que entra hace más valiosa la plataforma para todos los que ya estaban.",
    actores: [
      "residentes",
      "administracion",
      "comercios",
      "porteria",
      "propietarios",
    ],
  },
];
