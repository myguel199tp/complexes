export interface CreateBookingResponse {
  booking: {
    id: string;
    holidayId: string;
    email: string;
    nameMain: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    status: string;
    createdAt: string;
  };
  token: string;
  redirectUrl: string;
}
