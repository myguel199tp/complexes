// services/councilService.ts

import {
  AddMemberRequest,
  AssignRoleRequest,
  CreateMeetingRequest,
  CreateVoteRequest,
  InitializeCouncilRequest,
  VoteRequest,
} from "./request/councilRequest";

import {
  CouncilMemberResponse,
  MeetingResponse,
  VoteResponse,
  VoteResultResponse,
  StartFinishMeetingResponse,
} from "./response/councilResponse";

export class CouncilService {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/council`;

  private async fetcher<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    let data: unknown;

    try {
      data = await res.json();
    } catch {
      throw new Error("Respuesta inválida del servidor");
    }

    if (!res.ok) {
      const error = data as { message?: string };
      throw new Error(error.message || "Error en la petición");
    }

    return data as T;
  }

  // 🟢 Inicializar consejo
  initialize(data: InitializeCouncilRequest): Promise<CouncilMemberResponse[]> {
    return this.fetcher(`${this.baseUrl}/initialize`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 🟡 Asignar roles
  assignRoles(data: AssignRoleRequest[]): Promise<void> {
    return this.fetcher(`${this.baseUrl}/assign-roles`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 📅 Crear reunión
  createMeeting(data: CreateMeetingRequest): Promise<MeetingResponse> {
    return this.fetcher(`${this.baseUrl}/meeting`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ▶️ Iniciar reunión
  startMeeting(id: string): Promise<StartFinishMeetingResponse> {
    return this.fetcher(`${this.baseUrl}/meeting/${id}/start`, {
      method: "POST",
    });
  }

  // 🧾 Finalizar reunión
  finishMeeting(id: string): Promise<StartFinishMeetingResponse> {
    return this.fetcher(`${this.baseUrl}/meeting/${id}/finish`, {
      method: "POST",
    });
  }

  // 🗳️ Crear votación
  createVote(data: CreateVoteRequest): Promise<VoteResponse> {
    return this.fetcher(`${this.baseUrl}/vote`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ✅ Votar
  vote(data: VoteRequest): Promise<void> {
    return this.fetcher(`${this.baseUrl}/vote/cast`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ✍️ Firmar acta
  signMeeting(meetingId: string): Promise<void> {
    return this.fetcher(`${this.baseUrl}/meeting/${meetingId}/sign`, {
      method: "POST",
    });
  }

  // ➕ Agregar miembro
  addMember(data: AddMemberRequest): Promise<void> {
    return this.fetcher(`${this.baseUrl}/add-member`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ➖ Eliminar miembro
  removeMember(data: AddMemberRequest): Promise<void> {
    return this.fetcher(`${this.baseUrl}/remove-member`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 📊 Resultados de votación
  getVoteResults(voteId: string): Promise<VoteResultResponse[]> {
    return this.fetcher(`${this.baseUrl}/vote/${voteId}/results`);
  }
}
