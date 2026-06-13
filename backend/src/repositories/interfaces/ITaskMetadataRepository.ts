import { TaskMetadata, TaskPriority } from '../../models/TaskMetadata';

export interface UpsertTaskMetadataData {
  tags?: string[];
  priority?: TaskPriority;
  notes?: string;
  historyEntry?: { action: string; at?: Date };
}

export interface ITaskMetadataRepository {
  findByTaskId(taskId: number): Promise<TaskMetadata | null>;
  upsert(taskId: number, userId: number, data: UpsertTaskMetadataData): Promise<TaskMetadata>;
  deleteByTaskId(taskId: number): Promise<void>;
}
