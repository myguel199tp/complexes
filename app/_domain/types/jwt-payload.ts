export interface JWTPayload {
  sub: string;
  role: "owner" | "employee" | "admin" | "tenant" | "family";
  exp: number;
  iat?: number;
}
