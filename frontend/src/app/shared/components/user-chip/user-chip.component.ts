import { Component, input } from '@angular/core';
import { UserInitialsPipe } from '../../pipes/user-initials.pipe';

@Component({
  selector: 'app-user-chip',
  standalone: true,
  imports: [UserInitialsPipe],
  templateUrl: './user-chip.component.html',
  styleUrl: './user-chip.component.scss',
})
export class UserChipComponent {
  readonly name = input.required<string>();
}
