export interface CreatePackageResponse {
  id: string;
  name: string;
  module: string;
  maxItems: number;
  canHighlight: boolean;
  prioritySearch: boolean;
  price: number;
  durationDays: number;
}
