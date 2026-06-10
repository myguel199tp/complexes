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
}

// 📅 Meeting
export interface MeetingResponse {
  id: string;
  conjuntoId: string;
  title: string;
  description: string;
  date: string; // ⚠️ Date → string
  status: MeetingStatus;
}

// ▶️ Start / Finish Meeting Response
export interface StartFinishMeetingResponse {
  message: string;
  meeting: MeetingResponse;
}

// 🗳️ Vote
export interface VoteResponse {
  id: string;
  meetingId: string;
  title: string;
  description: string;
  options?: VoteOptionResponse[];
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
  ipAddress?: string;
  userAgent?: string;
}

// 📄 Meeting Minutes
export interface MeetingMinutesResponse {
  id: string;
  meetingId: string;
  summary: string;
  decisions: string;
}
