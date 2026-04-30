export interface TenantResponse {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  indicative: string;
  numberId: string;
  country: string;
  city: string;
  bornDate: string | null;
  file?: string;
  roles: string[];

  conjuntoRelations: ConjuntoRelation[];
}

export interface ConjuntoRelation {
  id: string;
  apartment: string;
  tower: string;
  isMainResidence: boolean;

  conjunto: {
    id: string;
    name: string;
  };
}
