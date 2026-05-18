import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface AddResponse {
  id: string;
}

export class DataAddServices {
  async adds(conjuntoId: string, data: FormData): Promise<AddResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/seller-profile/register`,
      {
        method: "POST",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        body: data,
      },
    );

    const dataResponse: AddResponse | ApiError = await response
      .json()
      .catch(() => ({ message: "Error desconocido", statusCode: 500 }));

    if (!response.ok) {
      const error = dataResponse as ApiError;
      throw new Error(error.message);
    }

    return dataResponse as AddResponse;
  }
}
