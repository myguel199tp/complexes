export type AccessPassType = "VISIT" | "RECURRING";

export type AccessPassStatus = "ACTIVE" | "USED" | "REVOKED" | "EXPIRED";

export interface AccessPassResponse {
  id: string;
  /** Contenido del QR. Prefijo `AP-`; los otros emisores usan `GA-` y `DR-`. */
  code: string;
  type: AccessPassType;
  status: AccessPassStatus;
  conjuntoId: string;
  apartment: string;
  nameUnit?: string | null;
  visitorName: string;
  visitorDocument?: string | null;
  plaque?: string | null;
  visitType: string;
  validFrom: string;
  validTo: string;
  /** 0 = sin tope de usos dentro de la vigencia. */
  maxUses: number;
  usedCount: number;
  lastUsedAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

/** Respuesta del escaneo en portería, sea cual sea el emisor del código. */
export interface ValidatedAccessResponse {
  allowed: true;
  source: "ACCESS_PASS" | "GUEST_ACCESS" | "DELIVERY_RUN";
  visitorName: string;
  apartment: string;
  validTo: string;
  /** Solo llega en pases de domicilios. */
  stops?: { orderId: string; deliveryAddress?: string }[];
  /** Registro creado en la bitácora de portería. */
  visit: { id: string; status: string };
}
