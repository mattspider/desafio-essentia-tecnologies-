import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userInitials',
  standalone: true,
})
export class UserInitialsPipe implements PipeTransform {
  transform(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }
}
