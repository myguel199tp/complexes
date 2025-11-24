export interface JWTPayload {
  sub: string;
  role: "owner" | "employee" | "admin";
  exp: number;
  iat?: number;
}
