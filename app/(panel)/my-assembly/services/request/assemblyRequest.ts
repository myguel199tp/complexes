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
  title: string;
  typeAssembly: AssemblyType;
  mode: AssemblyMode;
  startDate: string;
  endDate?: string;
  isVirtual?: boolean;
  link?: string;
  address?: string;
  conjuntoId?: string;
  description?: string;
  createdBy?: string;
  polls?: CreatePoll[];
}
