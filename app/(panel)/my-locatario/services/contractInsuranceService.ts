import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { ContractResponse } from "./response/contractResponse";

export type ContractManagementType = "DIRECT" | "INSURER" | "AGENCY";

export const MANAGEMENT_TYPE_LABEL: Record<ContractManagementType, string> = {
  DIRECT: "Directo con el propietario",
  INSURER: "Con aseguradora de arriendo",
  AGENCY: "Con inmobiliaria / administrador",
};

/**
 * Guarda quién administra el arriendo.
 *
 * Va como FormData porque puede traer el PDF de la póliza; los campos de texto
 * viajan sueltos, igual que en la creación del contrato.
 */
export async function updateContractInsuranceService(
  conjuntoId: string,
  contractId: number,
  data: FormData,
): Promise<{ message: string; data: ContractResponse }> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/contracts/${contractId}/insurance`,
    {
      method: "PATCH",
      body: data,
      headers: {
        "x-conjunto-id": conjuntoId,
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return await response.json();
}

/** Mismo criterio que las evidencias: la póliza sale por el proxy autenticado. */
export function contractPolicyUrl(policyFileUrl?: string): string | null {
  if (!policyFileUrl) return null;

  const filename = policyFileUrl.split("/").pop();

  return filename ? `/api/proxy/contracts/policy-file/${filename}` : null;
}
