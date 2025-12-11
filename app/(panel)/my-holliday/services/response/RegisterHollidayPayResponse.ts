export interface RegisterHollidayPayResponse {
  message: string;
  data: {
    id: number;
    fullName: string;
    idNumber: string;
    email: string;
    phone: string;

    bankName: string;
    accountNumber: string;
    accountType: "SAVINGS" | "CHECKING";

    swiftCode?: string;
    routingNumber?: string;
    clabe?: string;
    iban?: string;

    country: string;
    currency: string;
    paymentMethod: "CARD" | "BANK_TRANSFER" | "CASH" | "PAYPAL";

    createdAt: string;
    updatedAt: string;
  };
}
