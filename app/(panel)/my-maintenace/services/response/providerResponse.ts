/**
 * De dónde salió el proveedor. Un "b2b" no lo cargó el administrador: apareció
 * solo al confirmarse un contrato con un comercio aliado, y sus datos los
 * gestiona esa alianza.
 */
export type ProviderOrigin = "manual" | "b2b";

export interface ProviderResponse {
  id: string;
  name: string;
  service: string;
  phone?: string;
  email?: string;
  nit?: string;
  origin: ProviderOrigin;
  /** Solo en los de origen b2b. */
  comercioId?: string;
  b2bContractId?: string;
  /** Se apaga cuando la alianza se cancela o se suspende por mora. */
  isActive: boolean;
  createdAt: Date;
}
