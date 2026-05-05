// request/councilRequest.ts

// 🔹 ENUM (igual que backend)
export type CouncilRole = "president" | "secretary" | "treasurer" | "vocal";

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
