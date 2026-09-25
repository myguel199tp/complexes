import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

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

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  /** Si no llega, se usa el conjunto seleccionado en la sesión. */
  conjuntoId?: string;
}

/** Forma de `GET /council/vote/:id`: la votación con sus opciones contadas. */
interface VoteDetailResponse {
  vote: Omit<VoteResponse, "options">;
  options: { optionId: string; label: string; votes: number }[];
}

export class CouncilService {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/council`;

  /**
   * Todas las rutas del consejo exigen `x-conjunto-id`. Antes solo algunas lo
   * mandaban: las de una reunión (votaciones, resultados, acta, firmas) salían
   * sin él y el backend respondía 403, así que la pantalla nunca mostraba las
   * votaciones y nadie podía votar.
   */
  private async request<T>(
    path: string,
    fallbackError: string,
    { method = "GET", body, conjuntoId }: RequestOptions = {},
  ): Promise<T> {
    const res = await fetchWithAuth(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "x-conjunto-id":
          conjuntoId || useConjuntoStore.getState().conjuntoId || "",
        ...(body !== undefined && { "Content-Type": "application/json" }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      // El backend explica por qué rechaza (por ejemplo, que falta votar la
      // elección de presidente); eso sirve más que un mensaje genérico.
      const data = await res.json().catch(() => null);
      const message = Array.isArray(data?.message)
        ? data.message[0]
        : data?.message;

      throw new Error(message || fallbackError);
    }

    // Algunas rutas (asignar cargos, por ejemplo) responden sin cuerpo.
    const text = await res.text();

    return (text ? JSON.parse(text) : undefined) as T;
  }

  initialize(data: InitializeCouncilRequest): Promise<CouncilMemberResponse[]> {
    return this.request("/initialize", "Error al inicializar el consejo", {
      method: "POST",
      body: data,
      conjuntoId: data.conjuntoId,
    });
  }

  assignRoles(data: AssignRoleRequest[]): Promise<void> {
    return this.request("/assign-roles", "Error al asignar roles", {
      method: "POST",
      body: data,
      conjuntoId: data[0]?.conjuntoId,
    });
  }

  createMeeting(data: CreateMeetingRequest): Promise<MeetingResponse> {
    return this.request("/meeting", "Error al crear la reunión", {
      method: "POST",
      body: data,
      conjuntoId: data.conjuntoId,
    });
  }

  startMeeting(
    id: string,
    conjuntoId: string,
  ): Promise<StartFinishMeetingResponse> {
    return this.request(`/meeting/${id}/start`, "Error al iniciar la reunión", {
      method: "POST",
      conjuntoId,
    });
  }

  finishMeeting(id: string): Promise<StartFinishMeetingResponse> {
    return this.request(
      `/meeting/${id}/finish`,
      "Error al finalizar la reunión",
      { method: "POST" },
    );
  }

  createVote(data: CreateVoteRequest): Promise<VoteResponse> {
    return this.request("/vote", "Error al crear la votación", {
      method: "POST",
      body: data,
    });
  }

  vote(data: VoteRequest): Promise<void> {
    return this.request("/vote/cast", "Error al registrar el voto", {
      method: "POST",
      body: data,
    });
  }

  signMeeting(meetingId: string): Promise<void> {
    return this.request(`/meeting/${meetingId}/sign`, "Error al firmar el acta", {
      method: "POST",
    });
  }

  addMember(data: AddMemberRequest): Promise<void> {
    return this.request("/add-member", "Error al agregar el miembro", {
      method: "POST",
      body: data,
      conjuntoId: data.conjuntoId,
    });
  }

  removeMember(data: AddMemberRequest): Promise<void> {
    return this.request("/remove-member", "Error al eliminar el miembro", {
      method: "POST",
      body: data,
      conjuntoId: data.conjuntoId,
    });
  }

  getMembers(conjuntoId: string): Promise<CouncilMemberResponse[]> {
    return this.request("/members", "Error al obtener miembros", {
      conjuntoId,
    });
  }

  getCouncilStatus(conjuntoId: string): Promise<CouncilStatusResponse> {
    return this.request("/status", "Error al obtener el estado del consejo", {
      conjuntoId,
    });
  }

  getMeetings(conjuntoId: string): Promise<MeetingResponse[]> {
    return this.request("/meetings", "Error al obtener reuniones", {
      conjuntoId,
    });
  }

  /** El backend devuelve `{ meeting, votes, signatures, minutes }`. */
  async getMeeting(id: string): Promise<MeetingResponse> {
    const { meeting } = await this.request<{ meeting: MeetingResponse }>(
      `/meeting/${id}`,
      "Error al obtener la reunión",
    );

    return meeting;
  }

  getVotesByMeeting(meetingId: string): Promise<VoteResponse[]> {
    return this.request(
      `/meeting/${meetingId}/votes`,
      "Error al obtener votaciones",
    );
  }

  /** El backend devuelve la votación aparte y las opciones ya contadas. */
  async getVote(id: string): Promise<VoteResponse> {
    const { vote, options } = await this.request<VoteDetailResponse>(
      `/vote/${id}`,
      "Error al obtener la votación",
    );

    return {
      ...vote,
      options: options.map((option) => ({
        id: option.optionId,
        voteId: vote.id,
        label: option.label,
      })),
    };
  }

  getVoteResults(voteId: string): Promise<VoteResultResponse[]> {
    return this.request(
      `/vote/${voteId}/results`,
      "Error al obtener resultados de la votación",
    );
  }

  getMinutes(meetingId: string): Promise<MeetingMinutesResponse> {
    return this.request(
      `/meeting/${meetingId}/minutes`,
      "Error al obtener el acta",
    );
  }

  getSignatures(meetingId: string): Promise<MeetingSignatureResponse[]> {
    return this.request(
      `/meeting/${meetingId}/signatures`,
      "Error al obtener las firmas",
    );
  }

  startCall(meetingId: string): Promise<StartCallResponse> {
    return this.request(
      `/meeting/${meetingId}/call/start`,
      "Error al iniciar la videollamada",
      { method: "POST" },
    );
  }

  getCallToken(meetingId: string): Promise<CallTokenResponse> {
    return this.request(
      `/meeting/${meetingId}/call/token`,
      "Error al obtener el token de la videollamada",
      { method: "POST" },
    );
  }

  endCall(meetingId: string): Promise<CallSessionResponse> {
    return this.request(
      `/meeting/${meetingId}/call/end`,
      "Error al finalizar la videollamada",
      { method: "POST" },
    );
  }

  getCallStatus(meetingId: string): Promise<CallStatusResponse> {
    return this.request(
      `/meeting/${meetingId}/call`,
      "Error al obtener el estado de la videollamada",
    );
  }

  getRecordingUrl(meetingId: string): Promise<RecordingUrlResponse> {
    return this.request(
      `/meeting/${meetingId}/call/recording-url`,
      "Error al obtener la grabación",
    );
  }

  getFullHistory(meetingId: string): Promise<MeetingHistoryResponse> {
    return this.request(
      `/meeting/${meetingId}/history`,
      "Error al obtener el historial de la reunión",
    );
  }
}
