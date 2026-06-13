import { injectable } from 'tsyringe';
import { TaskMetadataModel } from '../infrastructure/database/mongoose/schemas/TaskMetadata.schema';
import { TaskMetadata } from '../models/TaskMetadata';
import {
  ITaskMetadataRepository,
  UpsertTaskMetadataData,
} from './interfaces/ITaskMetadataRepository';

@injectable()
export class TaskMetadataRepository implements ITaskMetadataRepository {
  async findByTaskId(taskId: number): Promise<TaskMetadata | null> {
    const document = await TaskMetadataModel.findOne({ taskId }).lean();

    return document ? this.toDomain(document) : null;
  }

  async upsert(
    taskId: number,
    userId: number,
    data: UpsertTaskMetadataData,
  ): Promise<TaskMetadata> {
    const historyEntry = data.historyEntry
      ? { action: data.historyEntry.action, at: data.historyEntry.at ?? new Date() }
      : undefined;

    const document = await TaskMetadataModel.findOneAndUpdate(
      { taskId },
      {
        $set: {
          userId,
          ...(data.tags !== undefined && { tags: data.tags }),
          ...(data.priority !== undefined && { priority: data.priority }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
        ...(historyEntry && {
          $push: { history: historyEntry },
        }),
        $setOnInsert: {
          taskId,
          userId,
          tags: data.tags ?? [],
          priority: data.priority ?? 'medium',
          notes: data.notes ?? '',
        },
      },
      { new: true, upsert: true },
    ).lean();

    if (!document) {
      throw new Error('Failed to upsert task metadata');
    }

    return this.toDomain(document);
  }

  async deleteByTaskId(taskId: number): Promise<void> {
    await TaskMetadataModel.deleteOne({ taskId });
  }

  private toDomain(document: {
    taskId: number;
    userId: number;
    tags: string[];
    priority: TaskMetadata['priority'];
    notes: string;
    history: Array<{ action: string; at: Date }>;
  }): TaskMetadata {
    return {
      taskId: document.taskId,
      userId: document.userId,
      tags: document.tags,
      priority: document.priority,
      notes: document.notes,
      history: document.history.map((entry) => ({
        action: entry.action,
        at: entry.at,
      })),
    };
  }
}
