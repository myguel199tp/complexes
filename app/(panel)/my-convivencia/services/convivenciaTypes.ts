export type CaseStatus =
  | "filed"
  | "assigned"
  | "summoned"
  | "agreement"
  | "no_agreement"
  | "escalated"
  | "sanctioned"
  | "appealed"
  | "closed";

export type EventType =
  | "filed"
  | "mediators_assigned"
  | "respondent_updated"
  | "summoned"
  | "descargos"
  | "petitioner_note"
  | "note"
  | "agreement"
  | "no_agreement"
  | "escalated"
  | "sanction"
  | "appeal"
  | "appeal_resolved"
  | "closed";

export interface ConvivenciaMe {
  isAdmin: boolean;
  isMediator: boolean;
  isPresident: boolean;
  hasPresident: boolean;
  canFile: boolean;
  myUnits: { relationId: string; unit: string | null; role: string }[];
  phone: string | null;
}

export interface CommitteeMember {
  userId: string;
  name: string;
  unit: string | null;
  periodStart: string | null;
  periodEnd: string | null;
}

export interface CommitteeCandidate {
  userId: string;
  name: string;
  unit: string | null;
  isMember: boolean;
}

export interface CaseSummary {
  id: string;
  number: number;
  status: CaseStatus;
  statusLabel: string;
  incidentDate: string | null;
  createdAt: string;
  petitionerName: string;
  petitionerUnit: string | null;
  respondentUnit: string | null;
  respondentDescription: string | null;
  summary: string;
  mediatorCount: number;
  hearingAt: string | null;
  iAmPetitioner: boolean;
  iAmRespondent: boolean;
}

export interface CaseEvent {
  id: string;
  type: EventType;
  actorName: string | null;
  actorRole: "peticionario" | "convocado" | "comite" | "administracion" | "consejo" | null;
  text: string | null;
  internal: boolean;
  late: boolean;
  createdAt: string;
}

export interface CaseCapabilities {
  view: boolean;
  seePrivate: boolean;
  assign: boolean;
  editRespondent: boolean;
  summon: boolean;
  note: boolean;
  petitionerNote: boolean;
  withdraw: boolean;
  descargos: boolean;
  recordOutcome: boolean;
  escalate: boolean;
  sanction: boolean;
  appeal: boolean;
  resolveAppeal: boolean;
  close: boolean;
}

export interface CaseDetail {
  id: string;
  number: number;
  status: CaseStatus;
  statusLabel: string;
  incidentDate: string | null;
  summary: string;
  createdAt: string;
  petitionerName: string;
  petitionerUnit: string | null;
  petitionerResidentType: string | null;
  /** Solo para el comité, la administración y el consejo. */
  petitionerDocument?: string | null;
  petitionerEmail?: string | null;
  petitionerPhone?: string | null;
  respondentRelationId: string | null;
  respondentUnit: string | null;
  respondentDescription: string | null;
  mediatorUserIds: string[];
  mediators: { userId: string; name: string }[];
  hearingAt: string | null;
  hearingPlace: string | null;
  descargosDeadline: string | null;
  outcome: string | null;
  sanctionType: "warning" | "fine" | null;
  sanctionedAt: string | null;
  appealDeadline: string | null;
  appealedAt: string | null;
  appealDecision: "confirmed" | "revoked" | null;
  closedAt: string | null;
  closedReason: string | null;
  events: CaseEvent[];
  capabilities: CaseCapabilities;
  viewer: {
    isPetitioner: boolean;
    isRespondent: boolean;
    isMediator: boolean;
    isAdmin: boolean;
    isPresident: boolean;
  };
}

export interface CreateCaseRequest {
  incidentDate?: string;
  summary: string;
  petitionerRelationId?: string;
  petitionerPhone?: string;
  respondentTower?: string;
  respondentApartment?: string;
  respondentDescription?: string;
}

export interface SanctionRequest {
  type: "warning" | "fine";
  title: string;
  reason: string;
  amount?: number;
  dueDate?: string;
  correctionDeadline?: string;
}
