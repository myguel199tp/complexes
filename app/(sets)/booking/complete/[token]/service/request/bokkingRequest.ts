export interface BookingTokenPayload {
  bookingId: string;
  nameMain: string;
  email: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

export interface ConfirmBookingPayload {
  bookingId: string;
  documentType: "CC" | "PASSPORT";
  documentNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  acceptTerms: boolean;
}
