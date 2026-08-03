export enum VisitType {
  RESIDENT = "RESIDENT",
  FAMILY = "FAMILY",
  FRIEND = "FRIEND",
  DELIVERY = "DELIVERY",
  MAIL = "MAIL",
  SERVICE = "SERVICE",
  MAINTENANCE = "MAINTENANCE",
  DOMESTIC_WORKER = "DOMESTIC_WORKER",
  DRIVER = "DRIVER",
  VISITOR = "VISITOR",
  CONTRACTOR = "CONTRACTOR",
  REAL_ESTATE = "REAL_ESTATE",
  SECURITY = "SECURITY",
  ADMIN = "ADMIN",
  EMERGENCY = "EMERGENCY",
  OTHER = "OTHER",
}

/**
 * Etiquetas del tipo de visitante. Vivían dentro de `form-info`, pero el
 * formulario de pases de acceso necesita exactamente la misma lista.
 */
export const visitTypeOptions = [
  { label: "Residente", value: VisitType.RESIDENT },
  { label: "Familiar", value: VisitType.FAMILY },
  { label: "Amigo", value: VisitType.FRIEND },
  { label: "Repartidor", value: VisitType.DELIVERY },
  { label: "Mensajería", value: VisitType.MAIL },
  { label: "Servicio técnico", value: VisitType.SERVICE },
  { label: "Mantenimiento", value: VisitType.MAINTENANCE },
  { label: "Empleado doméstico", value: VisitType.DOMESTIC_WORKER },
  { label: "Conductor", value: VisitType.DRIVER },
  { label: "Visitante", value: VisitType.VISITOR },
  { label: "Contratista", value: VisitType.CONTRACTOR },
  { label: "Inmobiliaria", value: VisitType.REAL_ESTATE },
  { label: "Seguridad", value: VisitType.SECURITY },
  { label: "Administración", value: VisitType.ADMIN },
  { label: "Emergencia", value: VisitType.EMERGENCY },
  { label: "Otro", value: VisitType.OTHER },
];
