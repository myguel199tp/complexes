import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/** Ruta guardada de la nueva imagen, para pintarla con `fileUrl`. */
export interface ConjuntoImageResponse {
  file: string;
}

export async function updateConjuntoImageService(
  conjuntoId: string,
  file: File,
): Promise<ConjuntoImageResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/image`,
    {
      method: "PATCH",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? "No se pudo cambiar la imagen");
  }

  return response.json();
}
