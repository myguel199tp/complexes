import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface BulkRegisterUserItem {
  name: string;
  lastName: string;
  email: string;
  numberId?: string;
  phone?: string;
  indicative?: string;
  country?: string;
  city?: string;
  bornDate?: string;
  pet?: boolean;
  council?: boolean;
  roles?: string[];
  conjuntoId?: string;
  tower?: string;
  apartment?: string;
  /** Una o varias, separadas por coma: cada una queda como vehículo de la unidad. */
  plaque?: string;
  /**
   * Tipo de los vehículos de la fila. `null` solo mientras se lee el Excel:
   * marca un valor que no es carro ni moto, y esa fila no se manda.
   */
  vehicleType?: "carro" | "moto" | null;
  /** Código de la celda del inventario para la primera placa (ej. A-45). */
  parkingSpot?: string;
  coefficient?: number;
  isMainResidence?: boolean;
}

export interface BulkRegisterDto {
  conjuntoId?: string;
  users: BulkRegisterUserItem[];
}

export interface BulkRegisterResult {
  email: string;
  status: "created" | "skipped" | "failed";
  userId?: string;
  reason?: string;
}

export interface BulkRegisterSummary {
  total: number;
  created: number;
  skipped: number;
  failed: number;
  results: BulkRegisterResult[];
}

export async function bulkRegisterService(
  dto: BulkRegisterDto,
): Promise<BulkRegisterSummary> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register-bulk`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message?.[0] || data?.message || "Error en registro masivo");
  }

  return data;
}
