import { Task, TaskMetadata } from '../../../core/models/task.model';

export interface TaskViewModel extends Task {
  metadata?: TaskMetadata | null;
  metadataLoading?: boolean;
  metadataError?: string | null;
  metadataFetched?: boolean;
}
