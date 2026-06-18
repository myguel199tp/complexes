import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

import {
  AddMemberRequest,
  AssignRoleRequest,
  CreateMeetingRequest,
  CreateVoteRequest,
  InitializeCouncilRequest,
  VoteRequest,
} from "./request/councilRequest";

import {
  CallStatusResponse,
  CallTokenResponse,
  CallSessionResponse,
  CouncilMemberResponse,
  CouncilStatusResponse,
  MeetingHistoryResponse,
  MeetingMinutesResponse,
  MeetingResponse,
  MeetingSignatureResponse,
  RecordingUrlResponse,
  StartCallResponse,
  StartFinishMeetingResponse,
  VoteResponse,
  VoteResultResponse,
} from "./response/councilResponse";

export class CouncilService {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/council`;

  async initialize(
    data: InitializeCouncilRequest,
  ): Promise<CouncilMemberResponse[]> {
    const res = await fetchWithAuth(`${this.baseUrl}/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": data.conjuntoId,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al inicializar el consejo");
    return res.json();
  }

  async assignRoles(data: AssignRoleRequest[]): Promise<void> {
    const conjuntoId = data[0]?.conjuntoId ?? "";
    const res = await fetchWithAuth(`${this.baseUrl}/assign-roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al asignar roles");
  }

  async createMeeting(data: CreateMeetingRequest): Promise<MeetingResponse> {
    const res = await fetchWithAuth(`${this.baseUrl}/meeting`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": data.conjuntoId,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear la reunión");
    return res.json();
  }

  async startMeeting(
    id: string,
    conjuntoId: string,
  ): Promise<StartFinishMeetingResponse> {
    const res = await fetchWithAuth(`${this.baseUrl}/meeting/${id}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
    });
    if (!res.ok) throw new Error("Error al iniciar la reunión");
    return res.json();
  }

  async finishMeeting(id: string): Promise<StartFinishMeetingResponse> {
    const res = await fetchWithAuth(`${this.baseUrl}/meeting/${id}/finish`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Error al finalizar la reunión");
    return res.json();
  }

  async createVote(data: CreateVoteRequest): Promise<VoteResponse> {
    const res = await fetchWithAuth(`${this.baseUrl}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear la votación");
    return res.json();
  }

  async vote(data: VoteRequest): Promise<void> {
    const res = await fetchWithAuth(`${this.baseUrl}/vote/cast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al registrar el voto");
  }

  async signMeeting(meetingId: string): Promise<void> {
    const res = await fetchWithAuth(
      `${this.baseUrl}/meeting/${meetingId}/sign`,
      {
        method: "POST",
      },
    );
    if (!res.ok) throw new Error("Error al firmar el acta");
  }

  async addMember(data: AddMemberRequest): Promise<void> {
    const res = await fetchWithAuth(`${this.baseUrl}/add-member`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": data.conjuntoId,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al agregar el miembro");
  }

  async removeMember(data: AddMemberRequest): Promise<void> {
    const res = await fetchWithAuth(`${this.baseUrl}/remove-member`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": data.conjuntoId,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al eliminar el miembro");
  }

  async getMembers(conjuntoId: string): Promise<CouncilMemberResponse[]> {
    const res = await fetchWithAuth(`${this.baseUrl}/members`, {
      method: "GET",
      headers: { "x-conjunto-id": conjuntoId },
    });
    if (!res.ok) throw new Error("Error al obtener miembros");
    return res.json();
  }

  async getCouncilStatus(conjuntoId: string): Promise<CouncilStatusResponse> {
    const res = await fetchWithAuth(`${this.baseUrl}/status`, {
      method: "GET",
      headers: { "x-conjunto-id": conjuntoId },
    });
    if (!res.ok) throw new Error("Error al obtener el estado del consejo");
    return res.json();
  }

  async getMeetings(conjuntoId: string): Promise<MeetingResponse[]> {
    const res = await fetchWithAuth(`${this.baseUrl}/meetings`, {
      method: "GET",
      headers: { "x-conjunto-id": conjuntoId },
    });
    if (!res.ok) throw new Error("Error al obtener reuniones");
    return res.json();
  }

  async getMeeting(id: string): Promise<MeetingResponse> {
    const res = await fetchWithAuth(`${this.baseUrl}/meeting/${id}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Error al obtener la reunión");
    return res.json();
  }

  async getVotesByMeeting(meetingId: string): Promise<VoteResponse[]> {
    const res = await fetchWithAuth(
      `${this.baseUrl}/meeting/${meetingId}/votes`,
      {
        method: "GET",
      },
    );
    if (!res.ok) throw new Error("Error al obtener votaciones");
    return res.json();
  }

  async getVote(id: string): Promise<VoteResponse> {
    const res = await fetchWithAuth(`${this.baseUrl}/vote/${id}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Error al obtener la votación");
    return res.json();
  }

  async getVoteResults(voteId: string): Promise<VoteResultResponse[]> {
    const res = await fetchWithAuth(`${this.baseUrl}/vote/${voteId}/results`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Error al obtener resultados de la votación");
    return res.json();
  }

  async getMinutes(meetingId: string): Promise<MeetingMinutesResponse> {
    const res = await fetchWithAuth(
      `${this.baseUrl}/meeting/${meetingId}/minutes`,
      {
        method: "GET",
      },
    );
    if (!res.ok) throw new Error("Error al obtener el acta");
    return res.json();
  }

  async getSignatures(meetingId: string): Promise<MeetingSignatureResponse[]> {
    const res = await fetchWithAuth(
      `${this.baseUrl}/meeting/${meetingId}/signatures`,
      {
        method: "GET",
      },
    );
    if (!res.ok) throw new Error("Error al obtener las firmas");
    return res.json();
  }

  async startCall(meetingId: string): Promise<StartCallResponse> {
    const res = await fetchWithAuth(
      `${this.baseUrl}/meeting/${meetingId}/call/start`,
      { method: "POST" },
    );
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message || "Error al iniciar la videollamada");
    }
    return res.json();
  }

  async getCallToken(meetingId: string): Promise<CallTokenResponse> {
    const res = await fetchWithAuth(
      `${this.baseUrl}/meeting/${meetingId}/call/token`,
      { method: "POST" },
    );
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(
        body?.message || "Error al obtener el token de la videollamada",
      );
    }
    return res.json();
  }

  async endCall(meetingId: string): Promise<CallSessionResponse> {
    const res = await fetchWithAuth(
      `${this.baseUrl}/meeting/${meetingId}/call/end`,
      { method: "POST" },
    );
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message || "Error al finalizar la videollamada");
    }
    return res.json();
  }

  async getCallStatus(meetingId: string): Promise<CallStatusResponse> {
    const res = await fetchWithAuth(`${this.baseUrl}/meeting/${meetingId}/call`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Error al obtener el estado de la videollamada");
    return res.json();
  }

  async getRecordingUrl(meetingId: string): Promise<RecordingUrlResponse> {
    const res = await fetchWithAuth(
      `${this.baseUrl}/meeting/${meetingId}/call/recording-url`,
      { method: "GET" },
    );
    if (!res.ok) throw new Error("Error al obtener la grabación");
    return res.json();
  }

  async getFullHistory(meetingId: string): Promise<MeetingHistoryResponse> {
    const res = await fetchWithAuth(
      `${this.baseUrl}/meeting/${meetingId}/history`,
      { method: "GET" },
    );
    if (!res.ok) throw new Error("Error al obtener el historial de la reunión");
    return res.json();
  }
}
