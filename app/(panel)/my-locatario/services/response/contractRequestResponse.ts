export type ContractRequestType =
  "DAMAGE" | "MAINTENANCE" | "CLAIM" | "ADMINISTRATIVE" | "OTHER";

export type ContractRequestPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type ContractRequestStatus =
  "OPEN" | "IN_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "REJECTED" | "CLOSED";

export type ContractRequestTarget = "OWNER" | "INSURER" | "ADMIN";

export type ContractRequestCostBearer =
  "UNDEFINED" | "OWNER" | "TENANT" | "INSURER" | "SHARED";

export interface ContractRequestFileResponse {
  id: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
}

export interface ContractRequestMessageResponse {
  id: string;
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  message?: string;
  statusFrom?: ContractRequestStatus;
  statusTo?: ContractRequestStatus;
  isSystem: boolean;
  createdAt: string;
}

export interface ContractRequestResponse {
  id: number;
  /** Número visible del expediente: SOL-2026-00042. */
  radicado: string;

  contractId: number;

  createdById: string;
  createdByName?: string;
  createdByRole?: string;

  type: ContractRequestType;
  typeLabel: string;
  category?: string;
  title: string;
  description: string;
  location?: string;

  priority: ContractRequestPriority;
  status: ContractRequestStatus;
  routedTo: ContractRequestTarget;

  costBearer: ContractRequestCostBearer;
  estimatedCost: number | null;
  actualCost: number | null;

  insurerName?: string;
  insurerPolicyNumber?: string;
  insurerClaimNumber?: string;
  insurerNotifiedAt?: string;

  resolution?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  closedAt?: string;

  createdAt: string;
  updatedAt: string;

  filesCount: number;
  files: ContractRequestFileResponse[];
  messages: ContractRequestMessageResponse[];
}

/** Etiquetas en español, en un solo sitio para que web y tabla no diverjan. */
export const REQUEST_STATUS_LABEL: Record<ContractRequestStatus, string> = {
  OPEN: "Abierta",
  IN_REVIEW: "En revisión",
  IN_PROGRESS: "En proceso",
  RESOLVED: "Resuelta",
  REJECTED: "Rechazada",
  CLOSED: "Cerrada",
};

export const REQUEST_PRIORITY_LABEL: Record<ContractRequestPriority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const REQUEST_TYPE_LABEL: Record<ContractRequestType, string> = {
  DAMAGE: "Daño",
  MAINTENANCE: "Mantenimiento",
  CLAIM: "Reclamación",
  ADMINISTRATIVE: "Trámite",
  OTHER: "Otro",
};

export const REQUEST_TARGET_LABEL: Record<ContractRequestTarget, string> = {
  OWNER: "Propietario",
  INSURER: "Aseguradora",
  ADMIN: "Administración",
};

export const REQUEST_COST_BEARER_LABEL: Record<
  ContractRequestCostBearer,
  string
> = {
  UNDEFINED: "Sin definir",
  OWNER: "Propietario",
  TENANT: "Arrendatario",
  INSURER: "Aseguradora",
  SHARED: "Compartido",
};
