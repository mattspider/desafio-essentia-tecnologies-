import { FormBuilder } from '@angular/forms';
import { displayPriority, displayTags, parseTagsInput } from './task-display.util';
import { TaskViewModel } from '../models/task-view.model';

function buildTask(overrides: Partial<TaskViewModel> = {}): TaskViewModel {
  return {
    id: 1,
    title: 'Tarefa',
    description: null,
    completed: false,
    userId: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('task-display.util', () => {
  const fb = new FormBuilder();

  describe('parseTagsInput', () => {
    it('should split, trim and filter empty tags', () => {
      expect(parseTagsInput('urgente, trabalho , ,pessoal')).toEqual([
        'urgente',
        'trabalho',
        'pessoal',
      ]);
    });

    it('should return empty array for blank input', () => {
      expect(parseTagsInput('   ')).toEqual([]);
    });
  });

  describe('displayPriority', () => {
    it('should prefer metadata priority when available', () => {
      const task = buildTask({
        metadata: {
          taskId: 1,
          userId: 1,
          tags: [],
          priority: 'high',
          notes: '',
          history: [],
        },
      });

      expect(displayPriority(task)).toBe('high');
    });

    it('should fall back to form value when metadata is missing', () => {
      const form = fb.nonNullable.group({ priority: ['low'], tagsInput: [''] });
      expect(displayPriority(buildTask(), form)).toBe('low');
    });

    it('should default to medium when no metadata or form', () => {
      expect(displayPriority(buildTask())).toBe('medium');
    });
  });

  describe('displayTags', () => {
    it('should return metadata tags when present', () => {
      const task = buildTask({
        metadata: {
          taskId: 1,
          userId: 1,
          tags: ['api', 'docs'],
          priority: 'medium',
          notes: '',
          history: [],
        },
      });

      expect(displayTags(task)).toEqual(['api', 'docs']);
    });

    it('should parse tags from form when metadata has no tags', () => {
      const form = fb.nonNullable.group({ priority: ['medium'], tagsInput: ['a, b'] });
      expect(displayTags(buildTask(), form)).toEqual(['a', 'b']);
    });

    it('should return empty array when no tags source exists', () => {
      expect(displayTags(buildTask())).toEqual([]);
    });
  });
});
