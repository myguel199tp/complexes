export interface CreateProviderRequest {
  name: string;
  service: string;
  phone?: string;
  email?: string;
  conjuntoId?: string;
  indicative?: string;
}
