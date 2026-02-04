import { ExternalPlatform } from "../request/externaRequest";

export interface ExternalResponse {
  platform: ExternalPlatform;
  listingUrl: string;
  externalId?: string;
  icalUrl?: string;
}
