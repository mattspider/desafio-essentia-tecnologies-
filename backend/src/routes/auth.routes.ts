import { Router } from 'express';
import { container } from '../container';
import { AuthController } from '../controllers/AuthController';
import { loginSchema, registerSchema } from '../dtos/auth.dto';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';

export function createAuthRouter(): Router {
  const authRouter = Router();
  const authController = container.resolve(AuthController);

  authRouter.get('/csrf', authController.csrf);
  authRouter.post('/register', validateBody(registerSchema), authController.register);
  authRouter.post('/login', validateBody(loginSchema), authController.login);
  authRouter.get('/me', authMiddleware, authController.me);
  authRouter.post('/logout', authMiddleware, authController.logout);

  return authRouter;
}
