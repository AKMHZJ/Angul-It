import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ResultComponent } from './result.component';
import { CaptchaService } from '../core/captcha.service';
import { solve } from '../core/test-helpers';

describe('ResultComponent', () => {
  it('shows a summary and restarts a new session', async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [ResultComponent], providers: [provideRouter([])] }).compileComponents();
    const service = TestBed.inject(CaptchaService);
    service.start();
    service.submit('wrong');
    for (let i = 0; i < service.total(); i++) {
      service.goTo(i);
      service.submit(solve(service.currentStage()!.challenge));
    }
    const firstSession = service.session();

    const fixture = TestBed.createComponent(ResultComponent);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('tbody tr').length).toBe(4);
    expect(el.textContent).toContain('75%');

    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    (el.querySelector('.btn.primary') as HTMLButtonElement).click();
    expect(service.session()).not.toBe(firstSession);
    expect(service.isComplete()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/captcha']);
  });
});
