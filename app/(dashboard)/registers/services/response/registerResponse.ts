export interface RegisterResult {
  message: string;
}

export interface RegisterResponse {
  id: number;
  status: number;
  data: RegisterResult;
}
