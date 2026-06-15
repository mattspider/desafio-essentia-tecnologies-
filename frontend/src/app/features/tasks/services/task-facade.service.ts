import { Injectable, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateTaskRequest, TaskMetadata, TaskPriority } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { getApiErrorMessage } from '../../../core/utils/api-error.util';
import { TaskViewModel } from '../models/task-view.model';
import { parseTagsInput } from '../utils/task-display.util';
import { TASK_PRIORITIES } from '../utils/task-labels.util';

@Injectable()
export class TaskFacadeService {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly snackBar = inject(MatSnackBar);

  readonly priorities: TaskPriority[] = TASK_PRIORITIES;

  readonly tasks = signal<TaskViewModel[]>([]);
  readonly loading = signal(true);
  readonly creating = signal(false);
  readonly editingTaskId = signal<number | null>(null);

  readonly pendingCount = computed(
    () => this.tasks().filter((task) => !task.completed).length,
  );
  readonly completedCount = computed(
    () => this.tasks().filter((task) => task.completed).length,
  );

  readonly editForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
  });

  readonly metadataForms = new Map<number, FormGroup>();

  loadTasks(): void {
    this.loading.set(true);

    this.taskService.list().subscribe({
      next: (tasks) => {
        this.tasks.set(
          tasks.map((task) => ({
            ...task,
            metadata: null,
            metadataFetched: false,
          })),
        );
        this.metadataForms.clear();
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.snackBar.open(getApiErrorMessage(error, 'Erro ao carregar tarefas.'), 'Fechar', {
          duration: 4000,
        });
      },
    });
  }

  createTask(payload: CreateTaskRequest, afterCreate?: () => void): void {
    if (this.creating()) {
      return;
    }

    this.creating.set(true);

    this.taskService.create(payload).subscribe({
      next: (task) => {
        this.tasks.update((items) => [
          { ...task, metadata: null, metadataFetched: false },
          ...items,
        ]);
        afterCreate?.();
        this.creating.set(false);
        this.snackBar.open('Tarefa criada.', 'Fechar', { duration: 2500 });
      },
      error: (error: unknown) => {
        this.creating.set(false);
        this.snackBar.open(getApiErrorMessage(error, 'Erro ao criar tarefa.'), 'Fechar', {
          duration: 4000,
        });
      },
    });
  }

  toggleCompleted(task: TaskViewModel): void {
    this.taskService.toggleCompleted(task.id).subscribe({
      next: (updated) => {
        this.tasks.update((items) =>
          items.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
        );
      },
      error: (error: unknown) => {
        this.snackBar.open(getApiErrorMessage(error, 'Erro ao atualizar tarefa.'), 'Fechar', {
          duration: 4000,
        });
      },
    });
  }

  startEdit(task: TaskViewModel): void {
    this.editingTaskId.set(task.id);
    this.editForm.setValue({
      title: task.title,
      description: task.description ?? '',
    });
  }

  cancelEdit(): void {
    this.editingTaskId.set(null);
  }

  saveEdit(taskId: number): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const { title, description } = this.editForm.getRawValue();

    this.taskService
      .update(taskId, {
        title,
        description: description.trim() ? description.trim() : null,
      })
      .subscribe({
        next: (updated) => {
          this.tasks.update((items) =>
            items.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
          );
          this.editingTaskId.set(null);
          this.snackBar.open('Tarefa atualizada.', 'Fechar', { duration: 2500 });
        },
        error: (error: unknown) => {
          this.snackBar.open(getApiErrorMessage(error, 'Erro ao salvar tarefa.'), 'Fechar', {
            duration: 4000,
          });
        },
      });
  }

  deleteTask(task: TaskViewModel): void {
    if (!confirm(`Remover "${task.title}"?`)) {
      return;
    }

    this.taskService.delete(task.id).subscribe({
      next: () => {
        this.tasks.update((items) => items.filter((item) => item.id !== task.id));
        this.metadataForms.delete(task.id);
        this.snackBar.open('Tarefa removida.', 'Fechar', { duration: 2500 });
      },
      error: (error: unknown) => {
        this.snackBar.open(getApiErrorMessage(error, 'Erro ao remover tarefa.'), 'Fechar', {
          duration: 4000,
        });
      },
    });
  }

  onPanelOpened(task: TaskViewModel): void {
    this.syncMetadataForm(task.id, this.defaultMetadata(task));

    if (task.metadataFetched || task.metadataLoading) {
      return;
    }

    task.metadataLoading = true;
    task.metadataError = null;

    this.taskService.getMetadata(task.id).subscribe({
      next: (metadata) => {
        task.metadata = metadata;
        task.metadataFetched = true;
        task.metadataLoading = false;
        this.syncMetadataForm(task.id, metadata);
        this.tasks.update((items) => [...items]);
      },
      error: (error: unknown) => {
        task.metadataLoading = false;
        task.metadataFetched = true;
        task.metadataError = getApiErrorMessage(error, 'Metadados indisponíveis.');
        this.syncMetadataForm(task.id, this.defaultMetadata(task));
        this.tasks.update((items) => [...items]);
      },
    });
  }

  saveMetadata(task: TaskViewModel): void {
    const form = this.metadataForms.get(task.id);
    if (!form || form.invalid) {
      form?.markAllAsTouched();
      return;
    }

    const { priority, notes, tagsInput } = form.getRawValue() as {
      priority: TaskPriority;
      notes: string;
      tagsInput: string;
    };

    this.taskService
      .upsertMetadata(task.id, { priority, notes, tags: parseTagsInput(tagsInput) })
      .subscribe({
        next: (metadata) => {
          task.metadata = metadata;
          task.metadataFetched = true;
          this.syncMetadataForm(task.id, metadata);
          this.tasks.update((items) => [...items]);
          this.snackBar.open('Metadados salvos.', 'Fechar', { duration: 2500 });
        },
        error: (error: unknown) => {
          this.snackBar.open(getApiErrorMessage(error, 'Erro ao salvar metadados.'), 'Fechar', {
            duration: 4000,
          });
        },
      });
  }

  private defaultMetadata(task: TaskViewModel): TaskMetadata {
    return {
      taskId: task.id,
      userId: task.userId,
      tags: [],
      priority: 'medium',
      notes: '',
      history: [],
    };
  }

  private syncMetadataForm(taskId: number, metadata: TaskMetadata): void {
    const existing = this.metadataForms.get(taskId);

    if (existing) {
      existing.patchValue({
        priority: metadata.priority,
        notes: metadata.notes,
        tagsInput: metadata.tags.join(', '),
      });
      return;
    }

    this.metadataForms.set(
      taskId,
      this.fb.nonNullable.group({
        priority: [metadata.priority, Validators.required],
        notes: [metadata.notes],
        tagsInput: [metadata.tags.join(', ')],
      }),
    );
  }
}
