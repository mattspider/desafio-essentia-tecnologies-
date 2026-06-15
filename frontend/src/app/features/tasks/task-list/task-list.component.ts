import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService } from '../../../core/services/task.service';
import { Task, TaskMetadata, TaskPriority } from '../../../core/models/task.model';
import { getApiErrorMessage } from '../../../core/utils/api-error.util';

interface TaskViewModel extends Task {
  metadata?: TaskMetadata | null;
  metadataLoading?: boolean;
  metadataError?: string | null;
  metadataFetched?: boolean;
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatTooltipModule,
    MatButtonToggleModule,
    ThemeToggleComponent,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  readonly user = this.authService.user;
  readonly priorities: TaskPriority[] = ['low', 'medium', 'high'];

  get pendingCount(): number {
    return this.tasks.filter((task) => !task.completed).length;
  }

  get completedCount(): number {
    return this.tasks.filter((task) => task.completed).length;
  }

  tasks: TaskViewModel[] = [];
  loading = true;
  creating = false;
  editingTaskId: number | null = null;

  readonly createForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
  });

  readonly editForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
  });

  readonly metadataForms = new Map<number, FormGroup>();

  ngOnInit(): void {
    this.loadTasks();
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  loadTasks(): void {
    this.loading = true;

    this.taskService.list().subscribe({
      next: (tasks) => {
        this.tasks = tasks.map((task) => ({
          ...task,
          metadata: null,
          metadataFetched: false,
        }));
        this.metadataForms.clear();
        this.loading = false;
      },
      error: (error: unknown) => {
        this.loading = false;
        this.snackBar.open(getApiErrorMessage(error, 'Erro ao carregar tarefas.'), 'Fechar', {
          duration: 4000,
        });
      },
    });
  }

  createTask(): void {
    if (this.createForm.invalid || this.creating) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.creating = true;
    const { title, description } = this.createForm.getRawValue();

    this.taskService
      .create({
        title,
        description: description.trim() ? description.trim() : null,
      })
      .subscribe({
        next: (task) => {
          this.tasks = [{ ...task, metadata: null, metadataFetched: false }, ...this.tasks];
          this.createForm.reset();
          this.creating = false;
          this.snackBar.open('Tarefa criada.', 'Fechar', { duration: 2500 });
        },
        error: (error: unknown) => {
          this.creating = false;
          this.snackBar.open(getApiErrorMessage(error, 'Erro ao criar tarefa.'), 'Fechar', {
            duration: 4000,
          });
        },
      });
  }

  toggleCompleted(task: TaskViewModel): void {
    this.taskService.toggleCompleted(task.id).subscribe({
      next: (updated) => {
        this.tasks = this.tasks.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
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
    this.editingTaskId = task.id;
    this.editForm.setValue({
      title: task.title,
      description: task.description ?? '',
    });
  }

  cancelEdit(): void {
    this.editingTaskId = null;
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
          this.tasks = this.tasks.map((item) =>
            item.id === updated.id ? { ...item, ...updated } : item,
          );
          this.editingTaskId = null;
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
        this.tasks = this.tasks.filter((item) => item.id !== task.id);
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
      },
      error: (error: unknown) => {
        task.metadataLoading = false;
        task.metadataFetched = true;
        task.metadataError = getApiErrorMessage(error, 'Metadados indisponíveis.');
        this.syncMetadataForm(task.id, this.defaultMetadata(task));
      },
    });
  }

  getMetadataForm(taskId: number) {
    return this.metadataForms.get(taskId);
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

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    this.taskService.upsertMetadata(task.id, { priority, notes, tags }).subscribe({
      next: (metadata) => {
        task.metadata = metadata;
        task.metadataFetched = true;
        this.syncMetadataForm(task.id, metadata);
        this.snackBar.open('Metadados salvos.', 'Fechar', { duration: 2500 });
      },
      error: (error: unknown) => {
        this.snackBar.open(getApiErrorMessage(error, 'Erro ao salvar metadados.'), 'Fechar', {
          duration: 4000,
        });
      },
    });
  }

  userInitials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  statusLabel(completed: boolean): string {
    return completed ? 'Concluída' : 'Pendente';
  }

  displayPriority(task: TaskViewModel): TaskPriority {
    return task.metadata?.priority ?? this.getMetadataForm(task.id)?.get('priority')?.value ?? 'medium';
  }

  displayTags(task: TaskViewModel): string[] {
    if (task.metadata?.tags?.length) {
      return task.metadata.tags;
    }

    const tagsInput = this.getMetadataForm(task.id)?.get('tagsInput')?.value as string | undefined;
    if (!tagsInput?.trim()) {
      return [];
    }

    return tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  priorityLabel(priority: TaskPriority): string {
    const labels: Record<TaskPriority, string> = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
    };
    return labels[priority];
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
