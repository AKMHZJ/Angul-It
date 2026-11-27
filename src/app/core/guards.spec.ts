import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { CaptchaService } from './captcha.service';
import { captchaGuard, resultGuard } from './guards';
import { solve } from './test-helpers';

describe('route guards', () => {
  let service: CaptchaService;
  let router: Router;
  const run = (guard: typeof resultGuard) =>
    TestBed.runInInjectionContext(() => guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
  const url = (r: unknown) => router.serializeUrl(r as UrlTree);

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    service = TestBed.inject(CaptchaService);
    router = TestBed.inject(Router);
  });

  it('sends users without a session home', () => {
    expect(url(run(captchaGuard))).toBe('/');
    expect(url(run(resultGuard))).toBe('/');
  });

  it('redirects to the current challenge when results are not earned', () => {
    service.start();
    expect(run(captchaGuard)).toBe(true);
    expect(url(run(resultGuard))).toBe('/captcha');
  });

  it('allows results once all stages are solved', () => {
    service.start();
    for (let i = 0; i < service.total(); i++) {
      service.goTo(i);
      service.submit(solve(service.currentStage()!.challenge));
    }
    expect(run(resultGuard)).toBe(true);
  });
});
