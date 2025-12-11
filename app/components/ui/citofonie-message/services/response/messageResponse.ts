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
}
