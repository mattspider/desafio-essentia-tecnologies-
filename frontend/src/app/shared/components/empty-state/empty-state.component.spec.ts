import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('title', 'Nenhuma tarefa ainda');
    fixture.componentRef.setInput('description', 'Crie sua primeira tarefa.');
    fixture.detectChanges();
  });

  it('should render title and description', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Nenhuma tarefa ainda');
    expect(element.textContent).toContain('Crie sua primeira tarefa.');
  });

  it('should use custom icon when provided', () => {
    fixture.componentRef.setInput('icon', 'task_alt');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('mat-icon') as HTMLElement;
    expect(icon.textContent?.trim()).toBe('task_alt');
  });
});
