import { Injectable, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CreateTaskRequest,
  TaskMetadata,
  TaskPriority,
  UpsertTaskMetadataRequest,
} from '../../../core/models/task.model';
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

  readonly metadataForms = signal(new Map<number, FormGroup>());

  private readonly metadataLoadSeq = new Map<number, number>();

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
        this.metadataForms.set(new Map());
        this.metadataLoadSeq.clear();
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
        this.metadataForms.update((forms) => {
          const next = new Map(forms);
          next.delete(task.id);
          return next;
        });
        this.metadataLoadSeq.delete(task.id);
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
    if (task.metadataFetched && task.metadata) {
      this.syncMetadataForm(task.id, task.metadata);
      this.notifyTasksChanged();
      return;
    }

    if (task.metadataLoading) {
      return;
    }

    if (task.metadataFetched) {
      return;
    }

    this.syncMetadataForm(task.id, this.defaultMetadata(task));
    this.notifyTasksChanged();

    task.metadataLoading = true;
    task.metadataError = null;
    const loadSeq = this.bumpMetadataLoadSeq(task.id);

    this.taskService.getMetadata(task.id).subscribe({
      next: (metadata) => {
        if (this.metadataLoadSeq.get(task.id) !== loadSeq) {
          return;
        }

        task.metadata = metadata;
        task.metadataFetched = true;
        task.metadataLoading = false;
        this.syncMetadataForm(task.id, metadata);
        this.notifyTasksChanged();
      },
      error: (error: unknown) => {
        if (this.metadataLoadSeq.get(task.id) !== loadSeq) {
          return;
        }

        task.metadataLoading = false;
        task.metadataFetched = true;
        task.metadataError = getApiErrorMessage(error, 'Metadados indisponíveis.');
        this.syncMetadataForm(task.id, this.defaultMetadata(task));
        this.notifyTasksChanged();
      },
    });
  }

  saveMetadata(task: TaskViewModel): void {
    const form = this.metadataForms().get(task.id);
    if (!form || form.invalid) {
      form?.markAllAsTouched();
      return;
    }

    const payload = this.buildMetadataPayload(task, form);
    const saveSeq = this.bumpMetadataLoadSeq(task.id);
    task.metadataLoading = false;

    this.taskService.upsertMetadata(task.id, payload).subscribe({
      next: (metadata) => {
        if (this.metadataLoadSeq.get(task.id) !== saveSeq) {
          return;
        }

        task.metadata = metadata;
        task.metadataFetched = true;
        this.syncMetadataForm(task.id, metadata);
        this.notifyTasksChanged();
        this.snackBar.open('Metadados salvos.', 'Fechar', { duration: 2500 });
      },
      error: (error: unknown) => {
        this.snackBar.open(getApiErrorMessage(error, 'Erro ao salvar metadados.'), 'Fechar', {
          duration: 4000,
        });
      },
    });
  }

  private buildMetadataPayload(task: TaskViewModel, form: FormGroup): UpsertTaskMetadataRequest {
    const { priority, notes, tagsInput } = form.getRawValue() as {
      priority: TaskPriority;
      notes: string;
      tagsInput: string;
    };

    const parsedTags = parseTagsInput(tagsInput);
    const loaded = task.metadata;

    return {
      priority,
      notes: notes.trim() || loaded?.notes || '',
      tags: parsedTags.length > 0 ? parsedTags : (loaded?.tags ?? []),
    };
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

  private bumpMetadataLoadSeq(taskId: number): number {
    const next = (this.metadataLoadSeq.get(taskId) ?? 0) + 1;
    this.metadataLoadSeq.set(taskId, next);
    return next;
  }

  private notifyTasksChanged(): void {
    this.tasks.update((items) => [...items]);
  }

  private syncMetadataForm(taskId: number, metadata: TaskMetadata): void {
    const values = {
      priority: metadata.priority,
      notes: metadata.notes ?? '',
      tagsInput: (metadata.tags ?? []).join(', '),
    };

    const existing = this.metadataForms().get(taskId);

    if (existing) {
      existing.setValue(values, { emitEvent: true });
      this.publishMetadataForms();
      return;
    }

    this.metadataForms.update((forms) => {
      const next = new Map(forms);
      next.set(
        taskId,
        this.fb.nonNullable.group({
          priority: [values.priority, Validators.required],
          notes: [values.notes],
          tagsInput: [values.tagsInput],
        }),
      );
      return next;
    });
  }

  private publishMetadataForms(): void {
    this.metadataForms.update((forms) => new Map(forms));
  }
}
