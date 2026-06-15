import { priorityLabel, statusLabel, TASK_PRIORITIES } from './task-labels.util';

describe('task-labels.util', () => {
  describe('priorityLabel', () => {
    it('should translate priorities to Portuguese', () => {
      expect(priorityLabel('low')).toBe('Baixa');
      expect(priorityLabel('medium')).toBe('Média');
      expect(priorityLabel('high')).toBe('Alta');
    });
  });

  describe('statusLabel', () => {
    it('should return Pendente for incomplete tasks', () => {
      expect(statusLabel(false)).toBe('Pendente');
    });

    it('should return Concluída for completed tasks', () => {
      expect(statusLabel(true)).toBe('Concluída');
    });
  });

  describe('TASK_PRIORITIES', () => {
    it('should list all priority levels in order', () => {
      expect(TASK_PRIORITIES).toEqual(['low', 'medium', 'high']);
    });
  });
});
