import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CaptchaComponent } from './captcha/captcha.component';
import { ResultComponent } from './result/result.component';
import { captchaGuard, resultGuard } from './core/guards';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Angul-It' },
  { path: 'captcha', component: CaptchaComponent, canActivate: [captchaGuard], title: 'Angul-It · Challenge' },
  { path: 'result', component: ResultComponent, canActivate: [resultGuard], title: 'Angul-It · Results' },
  { path: '**', redirectTo: '' },
];
