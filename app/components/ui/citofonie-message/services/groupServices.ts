import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { ChatGroup, ChatGroupMessage } from "./response/groupResponse";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Grupos de chat del conjunto.
 *
 * El conjunto va en el header `x-conjunto-id`, que es de donde lo lee el guard
 * del backend; como query param se ignora y la petición falla con 400.
 */
const headers = (conjuntoId: string) => ({
  "Content-Type": "application/json",
  "x-conjunto-id": conjuntoId,
});

async function unwrap<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

/** Grupos del conjunto en los que participo. */
export async function chatGroupsService(
  conjuntoId: string,
): Promise<ChatGroup[]> {
  return unwrap(
    await fetchWithAuth(`${BASE_URL}/api/chat/groups`, {
      method: "GET",
      headers: headers(conjuntoId),
    }),
  );
}

/** Las dos condiciones que habilitan la administración de grupos. */
export interface ChatGroupPermissions {
  /** `isEmployee && planAllowsGroups`: lo único que autoriza la acción. */
  canManage: boolean;
  /** Rol `employee` en *este* conjunto. */
  isEmployee: boolean;
  /** El chat de grupos va desde el plan Oro; en básico no está incluido. */
  planAllowsGroups: boolean;
  plan: string | null;
}

/**
 * ¿Puede este usuario crear y administrar grupos aquí?
 *
 * Lo decide el backend a partir de `UserConjuntoRelation.role === employee` en
 * *este* conjunto y del plan del conjunto. El front no lo deduce del rol
 * guardado en el store porque ese es del conjunto activo y puede quedar
 * desincronizado; además esconder un botón no es un permiso —quien manda es el
 * guard del servidor.
 *
 * Vienen separadas porque la UI las trata distinto: sin el rol no se muestra el
 * botón, y con el rol pero en plan básico se muestra deshabilitado.
 */
export async function chatGroupCanManageService(
  conjuntoId: string,
): Promise<ChatGroupPermissions> {
  return unwrap<ChatGroupPermissions>(
    await fetchWithAuth(`${BASE_URL}/api/chat/groups/can-manage`, {
      method: "GET",
      headers: headers(conjuntoId),
    }),
  );
}

export async function chatGroupMessagesService(
  groupId: string,
  conjuntoId: string,
): Promise<ChatGroupMessage[]> {
  return unwrap(
    await fetchWithAuth(`${BASE_URL}/api/chat/groups/${groupId}/messages`, {
      method: "GET",
      headers: headers(conjuntoId),
    }),
  );
}

export async function createChatGroupService(
  conjuntoId: string,
  body: {
    name: string;
    description?: string;
    tower?: string;
    memberIds?: string[];
  },
): Promise<ChatGroup> {
  return unwrap(
    await fetchWithAuth(`${BASE_URL}/api/chat/groups`, {
      method: "POST",
      headers: headers(conjuntoId),
      body: JSON.stringify(body),
    }),
  );
}

export async function addChatGroupMembersService(
  groupId: string,
  conjuntoId: string,
  memberIds: string[],
): Promise<ChatGroup> {
  return unwrap(
    await fetchWithAuth(`${BASE_URL}/api/chat/groups/${groupId}/members`, {
      method: "POST",
      headers: headers(conjuntoId),
      body: JSON.stringify({ memberIds }),
    }),
  );
}

export async function removeChatGroupMemberService(
  groupId: string,
  conjuntoId: string,
  userId: string,
): Promise<ChatGroup> {
  return unwrap(
    await fetchWithAuth(
      `${BASE_URL}/api/chat/groups/${groupId}/members/${userId}`,
      {
        method: "DELETE",
        headers: headers(conjuntoId),
      },
    ),
  );
}

/** Re-agrega a los que llegaron a la torre después de crear el grupo. */
export async function syncChatGroupTowerService(
  groupId: string,
  conjuntoId: string,
): Promise<ChatGroup> {
  return unwrap(
    await fetchWithAuth(`${BASE_URL}/api/chat/groups/${groupId}/sync-tower`, {
      method: "POST",
      headers: headers(conjuntoId),
    }),
  );
}
