export type BookingResponse = {
  id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  holiday: {
    id: string;
    name: string;
    city: string;
    mainImage?: string;
  };
};
