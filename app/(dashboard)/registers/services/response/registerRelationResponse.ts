export interface CreateUserConjuntoRelation {
  user: {
    id: string;
  };
  conjunto: {
    id: string;
  };
  role: "owner" | "tenant" | "resident" | "visitor" | "employee" | "user";
  isMainResidence?: boolean;
  active?: boolean;
  apartment?: string;
  plaque?: string;
  namesuer?: string;
  numberid?: string;
}

export interface CreateConjuntoRelation {
  status: number;
  data: CreateUserConjuntoRelation;
}
