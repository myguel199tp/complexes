export enum ExternalPlatform {
  AIRBNB = "AIRBNB",
  BOOKING = "BOOKING",
  VRBO = "VRBO",
}

export interface ExternalRequest {
  platform: ExternalPlatform;
  listingUrl: string;
  externalId?: string;
  icalUrl?: string;
}
