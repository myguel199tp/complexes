export interface CreateExchangeRequest {
  userId: string;
  homeId: string;
  city: string;
  availableFrom: string; // ISO string
  availableTo: string; // ISO string
  description: string;
}

export interface ExchangeResponse {
  id: string;
  userId: string;
  homeId: string;
  city: string;
  availableFrom: string;
  availableTo: string;
  description: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface RespondExchangeRequest {
  status: "accepted" | "rejected";
}
