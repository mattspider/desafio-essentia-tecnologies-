import { UserInitialsPipe } from './user-initials.pipe';

describe('UserInitialsPipe', () => {
  const pipe = new UserInitialsPipe();

  it('should return up to two initials from full name', () => {
    expect(pipe.transform('Matheus de Oliveira Soares')).toBe('MD');
  });

  it('should handle single name', () => {
    expect(pipe.transform('Matheus')).toBe('M');
  });

  it('should trim surrounding whitespace', () => {
    expect(pipe.transform('  Ana   Silva  ')).toBe('AS');
  });
});
