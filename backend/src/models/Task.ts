export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskData {
  title: string;
  description?: string | null;
  userId: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  completed?: boolean;
}
