import { Router } from 'express';
import { container } from '../container';
import { TaskController } from '../controllers/TaskController';
import {
  createTaskSchema,
  updateTaskSchema,
  upsertTaskMetadataSchema,
} from '../dtos/task.dto';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';

export function createTaskRouter(): Router {
  const taskRouter = Router();
  const taskController = container.resolve(TaskController);

  taskRouter.use(authMiddleware);

  taskRouter.get('/', taskController.list);
  taskRouter.post('/', validateBody(createTaskSchema), taskController.create);
  taskRouter.get('/:id', taskController.getById);
  taskRouter.put('/:id', validateBody(updateTaskSchema), taskController.update);
  taskRouter.patch('/:id/toggle', taskController.toggleCompleted);
  taskRouter.delete('/:id', taskController.remove);
  taskRouter.get('/:id/metadata', taskController.getMetadata);
  taskRouter.put('/:id/metadata', validateBody(upsertTaskMetadataSchema), taskController.upsertMetadata);

  return taskRouter;
}
