import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface TransferVehicle {
  plaque: string;
  type: "carro" | "moto";
  parkingType: "publico" | "privado";
  assignmentNumber?: string;
}

export interface TransferFamilyMember {
  nameComplet: string;
  lastComplet: string;
  email: string;
  phones?: string;
  indicative?: string;
  numberId?: string;
  dateBorn?: string | null;
  country?: string;
  city?: string;
}

export interface TransferOwnershipRequest {
  /** Relación del propietario saliente (se desactiva, no se borra) */
  oldOwnerId: string;
  conjuntoId: string;
  apartment: string;

  name: string;
  lastName: string;
  email: string;
  phone: string;
  indicative: string;
  numberId: string;
  country?: string;
  city?: string;
  bornDate?: string | null;
  tower?: string;

  file?: File | null;
  familyInfo?: TransferFamilyMember[];
  vehicles?: TransferVehicle[];
}

export interface TransferOwnershipResponse {
  message: string;
  newOwnerId: string;
}

/**
 * El endpoint espera multipart: la foto del nuevo propietario va en `file`
 * y las de los familiares en `familyFiles[i]`, que es como el controller
 * las vuelve a asociar por índice.
 */
export async function transferOwnershipService(
  payload: TransferOwnershipRequest,
): Promise<TransferOwnershipResponse> {
  const formData = new FormData();

  const append = (key: string, value?: string | null) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  };

  append("oldOwnerId", payload.oldOwnerId);
  append("conjuntoId", payload.conjuntoId);
  append("apartment", payload.apartment);

  append("name", payload.name);
  append("lastName", payload.lastName);
  append("email", payload.email);
  append("phone", payload.phone);
  append("indicative", payload.indicative);
  append("numberId", payload.numberId);
  append("country", payload.country);
  append("city", payload.city);
  append("bornDate", payload.bornDate);
  append("tower", payload.tower);

  formData.append("termsConditions", "true");

  if (payload.file) {
    formData.append("file", payload.file);
  }

  if (payload.familyInfo?.length) {
    formData.append("familyInfo", JSON.stringify(payload.familyInfo));
  }

  if (payload.vehicles?.length) {
    formData.append("vehicles", JSON.stringify(payload.vehicles));
  }

  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation/transfer-ownership`,
    {
      method: "POST",
      body: formData,
    },
  );

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo transferir la propiedad");
  }

  return data;
}
