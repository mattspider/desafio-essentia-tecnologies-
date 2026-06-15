import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatCardComponent } from './stat-card.component';

describe('StatCardComponent', () => {
  let fixture: ComponentFixture<StatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCardComponent);
    fixture.componentRef.setInput('label', 'Pendentes');
    fixture.componentRef.setInput('value', 3);
    fixture.componentRef.setInput('variant', 'pending');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render label and value', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Pendentes');
    expect(element.textContent).toContain('3');
    expect(element.querySelector('.stat-card--pending')).toBeTruthy();
  });
});
