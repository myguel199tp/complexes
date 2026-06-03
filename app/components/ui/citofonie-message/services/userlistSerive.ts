import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
export interface UsersPaginationResponse {
  data: EnsembleResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function allUserListService(
  conjuntoId: string,
  page: number = 1,
  limit: number = 1000,
): Promise<UsersPaginationResponse> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation/conjunto?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  return await response.json();
}
