export interface ComercioLoginResponse {
  /**
   * El token ya no viaja al cliente: queda en una cookie httpOnly que escribe
   * /api/comercio/login.
   */
  authenticated?: boolean;
}
