export interface File {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface Product {
  id: string;
  name: string;
  status: string;
  description?: string;
  price: number;
  files: string[];
  category?: string;
  /** `null` o ausente = el vendedor no lleva inventario de ese producto. */
  stock?: number | null;
  isActive?: boolean;
}

/** Servicio del catálogo: se agenda, no se lleva en cantidades. */
export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  durationMinutes: number;
  status: "ACTIVE" | "INACTIVE";
  requiresReservation: boolean;
  minNoticeHours: number;
  maxDaysAhead: number;
  files?: string[];
}

export interface AddResponses {
  id: string;
  files: string[];
  iduser: string;
  nameUnit: string;
  profession: string;
  webPage: string;
  name: string;
  email: string;
  description: string;
  phone: string;
  instagramred?: string;
  facebookred?: string;
  tiktokred?: string;
  youtubered?: string;
  xred?: string;
  products: Product[];
  services?: ServiceItem[];
}
