import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TaskMetadataRepository } from '../../src/repositories/TaskMetadataRepository';
import { TaskMetadataModel } from '../../src/infrastructure/database/mongoose/schemas/TaskMetadata.schema';

vi.mock('../../src/infrastructure/database/mongoose/schemas/TaskMetadata.schema', () => ({
  TaskMetadataModel: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

function createMutableDocument(overrides: Record<string, unknown> = {}) {
  const state = {
    taskId: 1,
    userId: 1,
    tags: ['teste', 'teste'],
    priority: 'high' as const,
    notes: 'teste',
    history: [] as Array<{ action: string; at: Date }>,
    save: vi.fn().mockResolvedValue(undefined),
    toObject: vi.fn(),
    ...overrides,
  };

  state.toObject.mockImplementation(() => ({
    taskId: state.taskId,
    userId: state.userId,
    tags: state.tags,
    priority: state.priority,
    notes: state.notes,
    history: state.history,
  }));

  return state;
}

describe('TaskMetadataRepository', () => {
  let repository: TaskMetadataRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new TaskMetadataRepository();
  });

  it('preserves existing tags and notes when priority-only update sends empty values', async () => {
    const document = createMutableDocument();
    vi.mocked(TaskMetadataModel.findOne).mockResolvedValue(document as never);

    const result = await repository.upsert(1, 1, {
      priority: 'high',
      tags: [],
      notes: '',
      historyEntry: { action: 'metadata_updated' },
    });

    expect(document.tags).toEqual(['teste', 'teste']);
    expect(document.notes).toBe('teste');
    expect(document.priority).toBe('high');
    expect(document.save).toHaveBeenCalled();
    expect(result.tags).toEqual(['teste', 'teste']);
    expect(result.notes).toBe('teste');
  });

  it('applies empty tags and notes when existing metadata is already empty', async () => {
    const document = createMutableDocument({ tags: [], notes: '' });
    vi.mocked(TaskMetadataModel.findOne).mockResolvedValue(document as never);

    await repository.upsert(1, 1, {
      priority: 'low',
      tags: [],
      notes: '',
    });

    expect(document.tags).toEqual([]);
    expect(document.notes).toBe('');
    expect(document.priority).toBe('low');
  });

  it('updates tags when caller sends non-empty tags', async () => {
    const document = createMutableDocument();
    vi.mocked(TaskMetadataModel.findOne).mockResolvedValue(document as never);

    await repository.upsert(1, 1, {
      tags: ['urgent'],
      notes: 'updated',
    });

    expect(document.tags).toEqual(['urgent']);
    expect(document.notes).toBe('updated');
  });
});
