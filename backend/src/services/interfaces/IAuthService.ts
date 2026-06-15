import { User } from '../../models/User';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

export interface TokenPayload {
  userId: number;
  email: string;
}

export interface IAuthService {
  register(input: RegisterInput): Promise<AuthResult>;
  login(input: LoginInput): Promise<AuthResult>;
  validateToken(token: string): Promise<TokenPayload>;
  getCurrentUser(userId: number): Promise<User>;
}
