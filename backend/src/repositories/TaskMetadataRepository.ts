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

    let document = await TaskMetadataModel.findOne({ taskId });

    if (!document) {
      document = await TaskMetadataModel.create({
        taskId,
        userId,
        tags: data.tags ?? [],
        priority: data.priority ?? 'medium',
        notes: data.notes ?? '',
        history: historyEntry ? [historyEntry] : [],
      });

      return this.toDomain(document.toObject());
    }

    const preserveExistingContent = this.shouldPreserveExistingContent(document, data);

    if (data.priority !== undefined) {
      document.priority = data.priority;
    }

    if (data.tags !== undefined && !preserveExistingContent) {
      document.tags = data.tags;
    }

    if (data.notes !== undefined && !preserveExistingContent) {
      document.notes = data.notes;
    }

    if (historyEntry) {
      document.history.push(historyEntry);
    }

    await document.save();

    return this.toDomain(document.toObject());
  }

  async deleteByTaskId(taskId: number): Promise<void> {
    await TaskMetadataModel.deleteOne({ taskId });
  }

  private shouldPreserveExistingContent(
    document: { tags: string[]; notes: string },
    data: UpsertTaskMetadataData,
  ): boolean {
    if (data.tags === undefined && data.notes === undefined) {
      return false;
    }

    const incomingTagsEmpty = data.tags === undefined || data.tags.length === 0;
    const incomingNotesEmpty = data.notes === undefined || data.notes === '';
    const existingHasContent = document.tags.length > 0 || document.notes !== '';

    return (
      incomingTagsEmpty &&
      incomingNotesEmpty &&
      existingHasContent &&
      data.priority !== undefined
    );
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
