export interface ChatGroupMember {
  id: string;
  userId: string;
  isAdmin: boolean;
  user?: {
    id: string;
    name?: string;
    lastName?: string;
    file?: string;
  };
}

export interface ChatGroup {
  id: string;
  conjuntoId: string;
  name: string;
  description?: string | null;
  /** Torre/bloque con el que se armó el grupo, si se armó así. */
  tower?: string | null;
  createdById: string;
  active: boolean;
  members?: ChatGroupMember[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Mensaje de grupo. A diferencia del 1-a-1 no trae `recipientId`: el
 * destinatario es el grupo, y el hilo es compartido por todos los miembros.
 */
export interface ChatGroupMessage {
  id: string;
  sender?: { id: string; name?: string; file?: string };
  senderId?: string;
  groupId: string;
  conjuntoId: string;
  message?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  tempId?: string;
}
