export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  conjuntoId: string;
  message?: string;
  imageUrl?: string | null;
  createdAt: string;
  name?: string;
  tempId?: string;
  /** 'pending' | 'delivered' | 'read'. */
  status?: "pending" | "delivered" | "read";
  readAt?: string | null;
  /** El historial viene como entidad: los ids llegan dentro de la relación. */
  sender?: { id?: string; name?: string };
  recipient?: { id?: string };
}
