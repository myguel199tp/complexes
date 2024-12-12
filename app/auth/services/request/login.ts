interface LoginRequest {
  email: string;
  password: string;
}

interface LoginComplexRequest {
  email: string;
  password: string;
  name: string;
  nameUnit: string;
}

export type { LoginRequest, LoginComplexRequest };
