import { EmergencyType } from "../response/emergencyResponse";

export interface ActivateEmergencyRequest {
  type: EmergencyType;
  customTypeLabel?: string;
  instructions?: string;
  evacuationRoute?: string;
  meetingPoint?: string;
}

export interface ResolveEmergencyRequest {
  summary?: string;
}
