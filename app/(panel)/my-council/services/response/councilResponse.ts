// response/councilResponse.ts

// 🔹 ENUMS (igual que backend)
export type CouncilRole =
  | "president"
  | "vice_president"
  | "secretary"
  | "treasurer"
  | "vocal_1"
  | "vocal_2"
  | "vocal_3"
  | "vocal_4"
  | "vocal_5"
  | "vocal_6"
  | "vocal_7"
  | "vocal_8"
  | "vocal_9"
  | "vocal_10"
  | "vocal_11"
  | "vocal_12"
  | "vocal_13"
  | "vocal_14"
  | "vocal_15"
  | "vocal_16"
  | "vocal_17"
  | "vocal_18"
  | "vocal_19"
  | null;

export type MeetingStatus = "pending" | "ongoing" | "finished";

/**
 * Tiempo máximo de una reunión en curso: al cumplirlo el backend la cierra
 * sola. Debe coincidir con COUNCIL_MEETING_MAX_DURATION_MINUTES del backend.
 */
export const MEETING_MAX_DURATION_MINUTES = 120;

/** `leader`: la finalizó quien conduce. `time_limit`: se cumplió el tiempo. */
export type MeetingFinishReason = "leader" | "time_limit";

/** Hasta cuándo puede seguir en curso; las viejas cuentan desde la fecha. */
export function meetingDeadline(meeting: MeetingResponse): Date {
  const start = new Date(meeting.startedAt ?? meeting.date).getTime();

  return new Date(start + MEETING_MAX_DURATION_MINUTES * 60_000);
}

/** `app` se condujo aquí; las otras dos se hicieron por fuera, con acta cargada. */
export type MeetingModality = "app" | "in_person" | "external_platform";

// 🧑‍⚖️ Council Member
export interface CouncilMemberResponse {
  id: string;
  userId: string;
  conjuntoId: string;
  role: CouncilRole;
  active: boolean;
  periodStart?: string; // Date → string
  periodEnd?: string; // Date → string
  joinedAt: string; // CreateDateColumn
  /** Nombre y apartamento del residente dentro del conjunto. */
  name: string | null;
  apartment: string | null;
}

// 📅 Meeting
export interface MeetingResponse {
  id: string;
  conjuntoId: string;
  title: string;
  description: string;
  date: string; // ⚠️ Date → string
  status: MeetingStatus;
  modality?: MeetingModality;
  externalPlatform?: string | null;
  /** Cuándo firmaron todos los que debían; null mientras falte alguien. */
  closedAt?: string | null;
  /** Cuándo pasó a en curso; de aquí corre el tiempo máximo. */
  startedAt?: string | null;
  finishedAt?: string | null;
  finishReason?: MeetingFinishReason | null;
}

// ▶️ Start / Finish Meeting Response
export interface StartFinishMeetingResponse {
  message: string;
  meeting: MeetingResponse;
}

// 📋 Council Status
export interface CouncilStatusResponse {
  president: CouncilMemberResponse | null;
  totalMembers: number;
  hasPresident: boolean;
  ongoingMeeting: MeetingResponse | null;
  pendingMeetings: MeetingResponse[];
  recentFinishedMeetings: MeetingResponse[];
}

// 🗳️ Vote
export interface VoteResponse {
  id: string;
  meetingId: string;
  title: string;
  description: string;
  options?: VoteOptionResponse[];
  /** Quién del consejo votó y quién no (no qué votó cada uno). */
  participation?: {
    voted: VoteParticipant[];
    missing: VoteParticipant[];
  };
}

export interface VoteParticipant {
  userId: string;
  name: string | null;
}

// 🟡 Vote Option
export interface VoteOptionResponse {
  id: string;
  voteId: string;
  label: string;
}

// 🟢 Vote Result (individual, si lo necesitas luego)
export interface VoteResult {
  id: string;
  voteId: string;
  userId: string;
  optionId: string;
}

// 📊 Vote Results (aggregated → tu endpoint actual)
export interface VoteResultResponse {
  optionId: string;
  label: string;
  votes: number;
}

// ✍️ Meeting Signature
export interface MeetingSignatureResponse {
  id: string;
  meetingId: string;
  userId: string;
  signedAt: string;
  documentHash: string;
  name?: string | null;
  ipAddress?: string;
  userAgent?: string;
}

// 📄 Meeting Minutes
export interface MeetingMinutesResponse {
  id: string;
  meetingId: string;
  summary: string;
  decisions: string;
  /** `uploaded`: el acta es un documento cargado, y lo que se firma es ese archivo. */
  source?: "generated" | "uploaded";
  hasDocument?: boolean;
  documentName?: string | null;
  documentHash?: string | null;
  uploadedAt?: string | null;
}

// 🧑‍⚖️ `GET /council/me`
export interface MyCouncilRoleResponse {
  isMember: boolean;
  role: CouncilRole;
  canUploadMinutes: boolean;
}

// 📄 La reunión como la devuelven las rutas del acta cargada
export interface MeetingDetailResponse {
  meeting: MeetingResponse;
  minutes: MeetingMinutesResponse | null;
}

// 📹 Videollamada
export type CallSessionStatus =
  | "created"
  | "in-progress"
  | "completed"
  | "failed";

export type RecordingStatus =
  | "none"
  | "pending"
  | "processing"
  | "available"
  | "failed";

export interface CallSessionResponse {
  id: string;
  meetingId: string;
  conjuntoId: string;
  roomSid: string | null;
  roomName: string;
  status: CallSessionStatus;
  startedAt: string | null;
  endedAt: string | null;
  maxDurationMinutes: number;
  createdByUserId: string;
  recordingStatus: RecordingStatus;
  compositionSid: string | null;
  recordingDurationSec: number | null;
  createdAt: string;
}

export interface CallParticipantResponse {
  id: string;
  callSessionId: string;
  userId: string;
  participantSid: string | null;
  identity: string | null;
  joinedAt: string | null;
  leftAt: string | null;
  durationSec: number | null;
  createdAt: string;
}

export interface StartCallResponse {
  session: CallSessionResponse;
  accessToken: string;
}

export interface CallTokenResponse {
  accessToken: string;
  roomName: string;
}

export interface CallStatusResponse {
  session: CallSessionResponse | null;
  participants: CallParticipantResponse[];
}

export interface RecordingUrlResponse {
  status: RecordingStatus;
  url: string | null;
  durationSec?: number | null;
}

// 📜 Historial completo de la reunión
export interface CallSessionWithParticipants extends CallSessionResponse {
  participants: CallParticipantResponse[];
}

export interface MeetingHistoryResponse {
  meeting: MeetingResponse;
  votes: VoteResponse[];
  signatures: MeetingSignatureResponse[];
  minutes: MeetingMinutesResponse | null;
  calls: CallSessionWithParticipants[];
}
