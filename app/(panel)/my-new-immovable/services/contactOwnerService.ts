import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { ContactOwnerResponse } from "./response/contactOwnerResponse";

/* El dueño se resuelve en el backend desde el token, no se envía por query */
export async function ContactsByOwnerService(
  inmovableId?: string,
): Promise<ContactOwnerResponse[]> {
  const queryParams = inmovableId
    ? `?${new URLSearchParams({ inmovableId }).toString()}`
    : "";

  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/contact/by-owner${queryParams}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return response.json();
}

export async function MarkContactAttendedService(
  id: string,
  attended: boolean,
): Promise<ContactOwnerResponse> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/contact/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attended }),
    },
  );

  if (!response.ok) {
    throw new Error("No se pudo actualizar el contacto");
  }

  return response.json();
}
