// request/councilRequest.ts

// 🔹 ENUM (igual que backend)
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
  | "vocal_19";

// 🟢 Inicializar consejo
export interface InitializeCouncilRequest {
  userIds: string[];
  conjuntoId: string;
}

// 🟡 Asignar roles
export interface AssignRoleRequest {
  userId: string;
  role: CouncilRole; // 🔥 tipado fuerte
  conjuntoId: string;
}

// 📅 Crear reunión
export interface CreateMeetingRequest {
  conjuntoId: string;
  title: string;
  description: string; // ⚠️ en backend NO es opcional
  date?: string; // opcional (si luego lo usas)
}

// 🗳️ Crear votación
export interface CreateVoteRequest {
  meetingId: string;
  title: string;
  description: string; // ⚠️ en backend es requerido
  options: string[]; // labels de opciones
}

// ✅ Votar
export interface VoteRequest {
  voteId: string;
  optionId: string;
}

// ➕ Agregar miembro
export interface AddMemberRequest {
  userId: string;
  conjuntoId: string;
}

// ➖ Remover miembro (mismo shape)
export type RemoveMemberRequest = AddMemberRequest;
