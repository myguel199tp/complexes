import { ExternalPlatform } from "../request/externaRequest";

export interface ExternalResponse {
  id: string;
  platform: ExternalPlatform;
  listingUrl: string;
  externalId?: string;
  icalUrl?: string;
  serviceFee: number;
  active: boolean;
  hollidayId?: string;
  conjuntoId?: string;
  createdAt?: string;
}
