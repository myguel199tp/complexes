export enum AssemblyType {
  ORDINARIA = "ordinaria",
  EXTRAORDINARIA = "extraordinaria",
  INFORMATIVA = "informativa",
}

export enum AssemblyMode {
  VIRTUAL = "virtual",
  PRESENCIAL = "presencial",
  MIXTA = "mixta",
}

export interface CreatePollOption {
  option: string;
}

export interface CreatePoll {
  question: string;
  options: CreatePollOption[];
}

export interface CreateAssemblyRequest {
  // --- Info básica ---
  title: string;
  typeAssembly: AssemblyType;
  mode: AssemblyMode;

  // --- Fechas ---
  startDate: string; // ISO 8601
  endDate?: string; // ISO 8601 opcional

  // --- Virtualidad ---
  isVirtual?: boolean;
  link?: string;

  // --- Ubicación ---
  address?: string;

  // --- Conjunto ---
  conjuntoId?: string;

  // --- Descripción ---
  description?: string;

  // --- Creador ---
  createdBy?: string;

  // --- Polls ---
  polls?: CreatePoll[];
}
