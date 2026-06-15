import { FormGroup } from '@angular/forms';
import { TaskPriority } from '../../../core/models/task.model';
import { TaskViewModel } from '../models/task-view.model';

export function parseTagsInput(tagsInput: string): string[] {
  return tagsInput
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function displayPriority(
  task: TaskViewModel,
  metadataForm?: FormGroup | null,
): TaskPriority {
  return (
    task.metadata?.priority ??
    (metadataForm?.get('priority')?.value as TaskPriority | undefined) ??
    'medium'
  );
}

export function displayTags(task: TaskViewModel, metadataForm?: FormGroup | null): string[] {
  if (task.metadata?.tags?.length) {
    return task.metadata.tags;
  }

  const tagsInput = metadataForm?.get('tagsInput')?.value as string | undefined;
  if (!tagsInput?.trim()) {
    return [];
  }

  return parseTagsInput(tagsInput);
}
