export interface CreateUserConjuntoRelation {
  user: {
    id: string;
  };
  conjunto: {
    id: string;
  };
  role: "owner" | "tenant" | "resident" | "visitor" | "employee";
  isMainResidence?: boolean;
  active?: boolean;
  apartment?: string;
  plaque?: string;
  numberid?: string;
}

export interface CreateConjuntoRelation {
  status: number;
  data: CreateUserConjuntoRelation;
}
