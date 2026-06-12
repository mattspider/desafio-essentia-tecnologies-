export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskHistoryEntry {
  action: string;
  at: Date;
}

export interface TaskMetadata {
  taskId: number;
  userId: number;
  tags: string[];
  priority: TaskPriority;
  notes: string;
  history: TaskHistoryEntry[];
}

export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
