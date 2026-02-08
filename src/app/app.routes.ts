import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard/dashboard';
import { OnboardingPageComponent } from './pages/onboarding/onboarding-page';
import { OnboardingSuccessPageComponent } from './pages/success/success';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    component: DashboardPageComponent
  },
  {
    path: 'onboarding',
    component: OnboardingPageComponent
  },
  {
    path: 'onboarding/success',
    component: OnboardingSuccessPageComponent
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
