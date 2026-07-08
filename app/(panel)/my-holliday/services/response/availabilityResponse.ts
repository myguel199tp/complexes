// Shape de HollidayAvailability (GET /api/hollidays/:id/availability)
export type AvailabilityDay = {
  id: string;
  date: string;
  isBooked: boolean;
  isBlocked: boolean;
};
