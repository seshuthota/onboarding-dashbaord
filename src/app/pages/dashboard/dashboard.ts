import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingStateService } from '../../services/onboarding-state.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardPageComponent {
  constructor(
    private readonly router: Router,
    public readonly onboardingState: OnboardingStateService
  ) { }

  startNew(): void {
    this.onboardingState.reset();
    this.router.navigateByUrl('/onboarding');
  }

  continueDraft(): void {
    this.onboardingState.loadDraft();
    this.router.navigateByUrl('/onboarding');
  }
}
