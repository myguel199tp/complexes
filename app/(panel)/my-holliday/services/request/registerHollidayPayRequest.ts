export interface RegisterOptionsHollidayPayRequest {
  fullName?: string;
  idNumber?: string;
  phone?: string;
  email?: string;
  bankName?: string;
  accountNumber?: string;
  swiftCode?: string;
  accountType?: "SAVINGS" | "CHECKING";
  routingNumber?: string;
  clabe?: string;
  iban?: string;
  country?: string;
  currency?: string;
  paymentMethod?: "CARD" | "BANK_TRANSFER" | "CASH" | "PAYPAL";
  otp?: string; 
}
