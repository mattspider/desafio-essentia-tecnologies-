export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskHistoryEntry {
  action: string;
  at: string;
}

export interface TaskMetadata {
  taskId: number;
  userId: number;
  tags: string[];
  priority: TaskPriority;
  notes: string;
  history: TaskHistoryEntry[];
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  completed?: boolean;
}

export interface UpsertTaskMetadataRequest {
  tags?: string[];
  priority?: TaskPriority;
  notes?: string;
}
