import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthPasswordFieldComponent } from './auth-password-field.component';

describe('AuthPasswordFieldComponent', () => {
  let fixture: ComponentFixture<AuthPasswordFieldComponent>;
  let control: FormControl<string>;

  beforeEach(async () => {
    control = new FormControl('', { nonNullable: true, validators: [Validators.required] });

    await TestBed.configureTestingModule({
      imports: [AuthPasswordFieldComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthPasswordFieldComponent);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('minLength', 6);
    fixture.detectChanges();
  });

  it('should start with password hidden', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('password');
    expect(fixture.componentInstance.hidePassword).toBeTrue();
  });

  it('should toggle password visibility', () => {
    const button = fixture.nativeElement.querySelector('button[matSuffix]') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('text');
    expect(fixture.componentInstance.hidePassword).toBeFalse();
  });

  it('should show required error when touched and empty', () => {
    control.markAsTouched();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Senha é obrigatória');
  });
});
