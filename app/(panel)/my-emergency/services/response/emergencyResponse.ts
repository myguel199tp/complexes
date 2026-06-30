export enum EmergencyType {
  EARTHQUAKE = "earthquake",
  FIRE = "fire",
  EXPLOSION = "explosion",
  FLOOD = "flood",
  LANDSLIDE = "landslide",
  STRUCTURAL_FAILURE = "structural_failure",
  MASS_MEDICAL = "mass_medical",
  OTHER = "other",
}

export enum EmergencyStatus {
  ACTIVE = "active",
  RESOLVED = "resolved",
  CANCELLED = "cancelled",
}

export enum EmergencyPriority {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  NONE = "none",
}

export interface EmergencyResponse {
  id: string;
  type: EmergencyType;
  customTypeLabel?: string;
  status: EmergencyStatus;
  activationMethod: string;
  instructions?: string;
  evacuationRoute?: string;
  meetingPoint?: string;
  startedAt: string;
  resolvedAt?: string;
  summary?: string;
}

export interface EmergencyDashboardResponse {
  emergencyId: string;
  status: EmergencyStatus;
  totalApartments: number;
  totalResidents: number;
  confirmed: number;
  unresponded: number;
  needHelp: number;
  medicalEmergencies: number;
  damageReported: number;
  towers: {
    tower: string;
    total: number;
    confirmed: number;
    needHelp: number;
  }[];
}

export interface EmergencyReportResponse {
  id: string;
  user: { id: string; name: string; lastName: string };
  tower?: string;
  apartment?: string;
  isOk?: boolean;
  needsHelp?: boolean;
  hasInjured?: boolean;
  hasVulnerablePeople?: boolean;
  vulnerablePeopleDetail?: string;
  canEvacuate?: boolean;
  hasFire: boolean;
  hasSmoke: boolean;
  hasGasLeak: boolean;
  hasStructuralDamage: boolean;
  freeTextNotes?: string;
  priority: EmergencyPriority;
  respondedAt?: string;
  createdAt: string;
}

export interface EmergencyEventResponse {
  id: string;
  type: string;
  actor?: { id: string; name: string; lastName: string };
  payload?: Record<string, unknown>;
  createdAt: string;
}
