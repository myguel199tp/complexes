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
  files: File[];
  category?: string;
  /** `null` = el vendedor no lleva inventario de ese producto. */
  stock?: number | null;
  isActive?: boolean;
}

/**
 * Servicio del catálogo. Se separa de `Product` porque no tiene cantidad ni
 * stock: tiene duración, y eso es lo que ocupa la agenda del vendedor.
 */
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
  files?: Array<File | string>;
}

/** Promedio de estrellas del negocio, calculado por el backend. */
export interface SellerReputation {
  average: number;
  count: number;
}

export interface AdvertisementResponses {
  id: string;
  files: File[];
  iduser: string;
  nameUnit: string;
  profession: string;
  webPage: string;
  name: string;
  email: string;
  description: string;
  statusOut: boolean;
  typeOfert: string;
  phone: string;
  instagramred?: string;
  facebookred?: string;
  tiktokred?: string;
  youtubered?: string;
  xred?: string;
  openingHour: string;
  closingHour: string;
  codigo: string;
  workDays: string[];
  products: Product[];
  services: ServiceItem[];
  reputation: SellerReputation;
}
