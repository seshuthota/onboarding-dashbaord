import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingConfig } from '../../models/onboarding.model';
import { OnboardingStateService } from '../../services/onboarding-state.service';

@Component({
    selector: 'app-onboarding-success-page',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './success.html',
    styleUrl: './success.scss'
})
export class OnboardingSuccessPageComponent {
    constructor(
        private readonly router: Router,
        private readonly onboardingState: OnboardingStateService
    ) { }

    get config(): OnboardingConfig {
        return this.onboardingState.getConfig();
    }

    downloadConfig(): void {
        const payload = JSON.stringify(this.config, null, 2);
        const blob = new Blob([payload], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `onboarding-config-${this.config.meta.draftId}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
    }

    goDashboard(): void {
        this.onboardingState.clearDraft();
        this.router.navigateByUrl('/dashboard');
    }
}
