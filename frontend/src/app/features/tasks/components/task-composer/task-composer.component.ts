import { Component, inject, input, output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CreateTaskRequest } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-composer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './task-composer.component.html',
  styleUrl: './task-composer.component.scss',
})
export class TaskComposerComponent {
  private readonly fb = inject(FormBuilder);

  @ViewChild(FormGroupDirective) private formDirective?: FormGroupDirective;

  readonly creating = input(false);
  readonly create = output<CreateTaskRequest>();

  showValidationErrors = false;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
  });

  submit(): void {
    if (this.form.invalid || this.creating()) {
      this.showValidationErrors = true;
      this.form.markAllAsTouched();
      return;
    }

    const { title, description } = this.form.getRawValue();
    this.create.emit({
      title,
      description: description.trim() ? description.trim() : null,
    });
  }

  reset(): void {
    this.showValidationErrors = false;
    if (this.formDirective) {
      this.formDirective.resetForm({ title: '', description: '' });
      return;
    }
    this.form.reset({ title: '', description: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
}
