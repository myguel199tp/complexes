// longitud-telefono.ts
export const phoneLengthByCountry: Record<string, number> = {
  CO: 10, // Colombia
  CL: 9, // Chile
  AR: 10, // Argentina
  PE: 9, // Perú
  MX: 10, // México
  US: 10, // Estados Unidos
  CA: 10, // Canadá
  EC: 9, // Ecuador
  VE: 10, // Venezuela
  BR: 11, // Brasil
};

export const countryMap: Record<string, keyof typeof phoneLengthByCountry> = {
  CHILE: "CL",
  COLOMBIA: "CO",
  ARGENTINA: "AR",
  PERU: "PE",
  MEXICO: "MX",
  "ESTADOS UNIDOS": "US",
  CANADA: "CA",
  ECUADOR: "EC",
  VENEZUELA: "VE",
  BRASIL: "BR",
};
