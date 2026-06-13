import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface UpdateProfileDto {
  name?: string;
  lastName?: string;
  phone?: string;
  indicative?: string;
  country?: string;
  city?: string;
  file?: File | null;
}

export async function updateProfileService(
  conjuntoId: string,
  dto: UpdateProfileDto,
): Promise<void> {
  const formData = new FormData();

  if (dto.name) formData.append("name", dto.name);
  if (dto.lastName) formData.append("lastName", dto.lastName);
  if (dto.phone) formData.append("phone", dto.phone);
  if (dto.indicative) formData.append("indicative", dto.indicative);
  if (dto.country) formData.append("country", dto.country);
  if (dto.city) formData.append("city", dto.city);
  if (dto.file) formData.append("file", dto.file);

  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
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
    throw new Error(error?.message ?? "Error al actualizar el perfil");
  }
}
