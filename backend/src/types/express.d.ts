import { TokenPayload } from '../services/interfaces/IAuthService';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};
