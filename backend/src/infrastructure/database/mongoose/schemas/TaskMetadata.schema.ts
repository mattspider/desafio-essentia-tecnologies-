import { Schema, model, Document } from 'mongoose';
import { TASK_PRIORITIES, TaskPriority } from '../../../../models/TaskMetadata';

export interface TaskMetadataDocument extends Document {
  taskId: number;
  userId: number;
  tags: string[];
  priority: TaskPriority;
  notes: string;
  history: Array<{
    action: string;
    at: Date;
  }>;
}

const taskHistoryEntrySchema = new Schema(
  {
    action: { type: String, required: true },
    at: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const taskMetadataSchema = new Schema<TaskMetadataDocument>(
  {
    taskId: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    tags: { type: [String], default: [] },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: 'medium',
    },
    notes: { type: String, default: '' },
    history: { type: [taskHistoryEntrySchema], default: [] },
  },
  {
    timestamps: true,
    collection: 'task_metadata',
  },
);

export const TaskMetadataModel = model<TaskMetadataDocument>(
  'TaskMetadata',
  taskMetadataSchema,
);
