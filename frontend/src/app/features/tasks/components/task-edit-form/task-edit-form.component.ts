import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-task-edit-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './task-edit-form.component.html',
  styleUrl: './task-edit-form.component.scss',
})
export class TaskEditFormComponent {
  readonly form = input.required<FormGroup>();
  readonly save = output<void>();
  readonly cancel = output<void>();
}
