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
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService } from '../../../core/services/task.service';
import { Task, TaskMetadata, TaskPriority } from '../../../core/models/task.model';
import { getApiErrorMessage } from '../../../core/utils/api-error.util';

interface TaskViewModel extends Task {
  metadata?: TaskMetadata | null;
  metadataLoading?: boolean;
  metadataError?: string | null;
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
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
    this.authService.logout();
  }

  loadTasks(): void {
    this.loading = true;

    this.taskService.list().subscribe({
      next: (tasks) => {
        this.tasks = tasks.map((task) => ({ ...task, metadata: null }));
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
          this.tasks = [{ ...task, metadata: null }, ...this.tasks];
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
    if (task.metadata || task.metadataLoading) {
      return;
    }

    task.metadataLoading = true;
    task.metadataError = null;

    this.taskService.getMetadata(task.id).subscribe({
      next: (metadata) => {
        task.metadata = metadata;
        task.metadataLoading = false;
        this.ensureMetadataForm(task.id, metadata);
      },
      error: (error: unknown) => {
        task.metadataLoading = false;
        task.metadataError = getApiErrorMessage(error, 'Metadados indisponíveis.');
        this.ensureMetadataForm(task.id, {
          taskId: task.id,
          userId: task.userId,
          tags: [],
          priority: 'medium',
          notes: '',
          history: [],
        });
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
        this.ensureMetadataForm(task.id, metadata);
        this.snackBar.open('Metadados salvos.', 'Fechar', { duration: 2500 });
      },
      error: (error: unknown) => {
        this.snackBar.open(getApiErrorMessage(error, 'Erro ao salvar metadados.'), 'Fechar', {
          duration: 4000,
        });
      },
    });
  }

  priorityLabel(priority: TaskPriority): string {
    const labels: Record<TaskPriority, string> = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
    };
    return labels[priority];
  }

  private ensureMetadataForm(taskId: number, metadata: TaskMetadata): void {
    if (this.metadataForms.has(taskId)) {
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
