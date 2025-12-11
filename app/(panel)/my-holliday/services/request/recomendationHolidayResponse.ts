export interface RecommendationItem {
  place: string;
  description: string;
  transport: string;
  type?: string;
  distance?: string;
  estimatedCost?: number;
  address?: string;
  notes?: string;
}

export interface CreateRecommendationsRequest {
  hollidayId: string;
  recommendations: RecommendationItem[];
}
