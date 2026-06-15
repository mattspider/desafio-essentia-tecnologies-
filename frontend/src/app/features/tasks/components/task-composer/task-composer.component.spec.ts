import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TaskComposerComponent } from './task-composer.component';

describe('TaskComposerComponent', () => {
  let fixture: ComponentFixture<TaskComposerComponent>;
  let component: TaskComposerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskComposerComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskComposerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not emit create when form is invalid', () => {
    const spy = spyOn(component.create, 'emit');
    component.submit();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit create with trimmed description', () => {
    const spy = spyOn(component.create, 'emit');
    component.form.setValue({ title: 'Nova tarefa', description: '  detalhe  ' });

    component.submit();

    expect(spy).toHaveBeenCalledWith({
      title: 'Nova tarefa',
      description: 'detalhe',
    });
  });

  it('should emit null description when blank', () => {
    const spy = spyOn(component.create, 'emit');
    component.form.setValue({ title: 'Só título', description: '   ' });

    component.submit();

    expect(spy).toHaveBeenCalledWith({
      title: 'Só título',
      description: null,
    });
  });

  it('should reset form and validation state after reset()', () => {
    component.showValidationErrors = true;
    component.form.setValue({ title: 'X', description: 'Y' });
    component.form.markAllAsTouched();

    component.reset();

    expect(component.form.getRawValue()).toEqual({ title: '', description: '' });
    expect(component.showValidationErrors).toBeFalse();
    expect(component.form.touched).toBeFalse();
    expect(component.form.pristine).toBeTrue();
  });

  it('should not emit when creating is true', () => {
    const spy = spyOn(component.create, 'emit');
    fixture.componentRef.setInput('creating', true);
    component.form.setValue({ title: 'Bloqueada', description: '' });
    fixture.detectChanges();

    component.submit();
    expect(spy).not.toHaveBeenCalled();
  });
});
