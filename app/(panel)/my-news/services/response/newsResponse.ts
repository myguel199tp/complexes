export interface NewsResponse {
  id: string;
  title: string;
  textmessage: string;
  nameUnit: string;
  mailAdmin: string;
  file: string;
  createdAt: string;
  conjuntoId: string;
  likes: number;
  dislikes: number;
  /** A quién va dirigida. Nulo en las noticias anteriores: eran para todos. */
  audience?: string | null;
  /** Torre destinataria, solo cuando `audience` es TOWER. */
  audienceTower?: string | null;
}
