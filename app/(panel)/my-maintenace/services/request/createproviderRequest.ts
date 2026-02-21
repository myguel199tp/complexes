export interface CreateProviderRequest {
  name: string;
  contactName: string;
  service: string;
  phone?: string;
  email?: string;
  conjuntoId?: string;
  indicative?: string;
  webPage?: string;
  nit?: string;
  hasContract?: boolean;
  contractStartDate?: string;
  contractEndDate?: string;
}
