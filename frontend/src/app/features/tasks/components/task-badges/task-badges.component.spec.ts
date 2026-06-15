import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskBadgesComponent } from './task-badges.component';

describe('TaskBadgesComponent', () => {
  let fixture: ComponentFixture<TaskBadgesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskBadgesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskBadgesComponent);
    fixture.componentRef.setInput('completed', false);
    fixture.componentRef.setInput('priority', 'high');
    fixture.componentRef.setInput('tags', ['urgente', 'trabalho']);
    fixture.componentRef.setInput('showPriority', true);
    fixture.detectChanges();
  });

  it('should render status badge as Pendente', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Pendente');
  });

  it('should render priority and tags when enabled', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Alta');
    expect(element.textContent).toContain('urgente');
    expect(element.textContent).toContain('trabalho');
    expect(element.querySelector('[data-priority="high"]')).toBeTruthy();
  });

  it('should hide priority badge when showPriority is false', () => {
    fixture.componentRef.setInput('showPriority', false);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[data-priority="high"]')).toBeFalsy();
  });

  it('should render Concluída when completed', () => {
    fixture.componentRef.setInput('completed', true);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Concluída');
    expect(element.querySelector('.badge--status-done')).toBeTruthy();
  });
});
