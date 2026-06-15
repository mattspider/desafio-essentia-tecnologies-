export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionResponse {
  user: User;
  csrfToken: string;
}

export interface MeResponse {
  user: User;
}

export interface CsrfResponse {
  csrfToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
