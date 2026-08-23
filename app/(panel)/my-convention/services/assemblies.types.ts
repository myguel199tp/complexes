export interface PollOption {
  id: string;
  option: string;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

export interface Assembly {
  id: string;
  title: string;
  typeAssembly: string;
  mode: string;
  startDate: string;
  endDate?: string;

  status: "DRAFT" | "SCHEDULED" | "ACTIVE" | "CLOSED";

  polls: Poll[];
}

export interface VotePayload {
  pollId: string;
  optionId: string;
  userId: string;
}

export enum VoteType {
  SIMPLE = "simple",
  ABSOLUTE = "absolute",
  QUALIFIED = "qualified",
  UNANIMOUS = "unanimous",
}

export const VOTE_TYPE_LABELS: Record<VoteType, string> = {
  [VoteType.SIMPLE]: "Mayoría simple (de los votos emitidos)",
  [VoteType.ABSOLUTE]: "Mayoría absoluta (de los coeficientes presentes)",
  [VoteType.QUALIFIED]: "Mayoría calificada (del censo completo)",
  [VoteType.UNANIMOUS]: "Unanimidad",
};

export interface PollOptionResult extends PollOption {
  votes: number;
  percent: number;
}

/** Lo que devuelve `GET /assemblies/:id/polls`. */
export interface PollResult {
  pollId: string;
  question: string;
  voteType: VoteType;
  requiredPercentage: number;
  base: "emitidos" | "presentes" | "censo";
  baseCoeficiente: number;
  emitidos: number;
  options: PollOptionResult[];
  winner: PollOptionResult | null;
  approved: boolean;
  tie: boolean;
  /**
   * El backend decide si la pregunta todavía se puede corregir —asamblea
   * abierta y sin votos—; la pantalla solo obedece. Recalcularlo aquí
   * duplicaría la regla y quedaría desactualizado en cuanto alguien vote desde
   * otro dispositivo.
   */
  editable: boolean;
}

export interface Quorum {
  totalCoeficiente: number;
  presentCoeficiente: number;
  percent: number;
  required: number;
  valid: boolean;
}

export interface CreatePollPayload {
  question: string;
  voteType?: VoteType;
  requiredPercentage?: number;
  options: { option: string }[];
}

export interface UpdatePollPayload {
  question?: string;
  voteType?: VoteType;
  requiredPercentage?: number;
  /**
   * Lista completa tal como debe quedar: las opciones con `id` se actualizan,
   * las que no lo traen se crean y las que falten se borran.
   */
  options?: { id?: string; option: string }[];
}
