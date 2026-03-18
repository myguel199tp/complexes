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
    const response = await fetch(`/api/market/create`, {
      method: "POST",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
      body: data,
    });

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
