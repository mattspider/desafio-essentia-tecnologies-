import { TaskPriority } from '../../../core/models/task.model';

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

export function priorityLabel(priority: TaskPriority): string {
  return PRIORITY_LABELS[priority];
}

export function statusLabel(completed: boolean): string {
  return completed ? 'Concluída' : 'Pendente';
}

export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
