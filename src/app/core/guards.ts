import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CaptchaService } from './captcha.service';

/** The challenge page needs an active session; otherwise go home. */
export const captchaGuard: CanActivateFn = () => {
  const captcha = inject(CaptchaService);
  return captcha.hasSession() ? true : inject(Router).createUrlTree(['/']);
};

/** Results are only reachable once every stage is solved. */
export const resultGuard: CanActivateFn = () => {
  const captcha = inject(CaptchaService);
  const router = inject(Router);
  if (captcha.isComplete()) return true;
  return captcha.hasSession() ? router.createUrlTree(['/captcha']) : router.createUrlTree(['/']);
};
