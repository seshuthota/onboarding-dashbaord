import { Injectable } from '@angular/core';
import {
  AuthConfig,
  AuthType,
  OnboardingConfig,
  defaultOnboardingConfig
} from '../models/onboarding.model';

const DRAFT_STORAGE_KEY = 'onboarding-dashboard-draft';

@Injectable({
  providedIn: 'root'
})
export class OnboardingStateService {
  private config: OnboardingConfig = structuredClone(defaultOnboardingConfig);

  readonly steps = [
    '/onboarding/start',
    '/onboarding/format',
    '/onboarding/auth',
    '/onboarding/request',
    '/onboarding/mapping',
    '/onboarding/review'
  ];

  getConfig(): OnboardingConfig {
    return structuredClone(this.config);
  }

  replaceConfig(next: OnboardingConfig): void {
    this.config = structuredClone(next);
    this.touchMeta();
  }

  updateCustomer(customer: OnboardingConfig['customer']): void {
    this.config.customer = structuredClone(customer);
    this.touchMeta();
  }

  updateFormat(format: OnboardingConfig['format']): void {
    this.config.format = structuredClone(format);
    this.touchMeta();
  }

  updateApi(api: OnboardingConfig['api']): void {
    this.config.api = structuredClone(api);
    this.touchMeta();
  }

  updateAuth(auth: AuthConfig): void {
    this.config.auth = structuredClone(auth);
    this.touchMeta();
  }

  updateMappingTemplate(templateId: string): void {
    this.config.mappingTemplateId = templateId;
    this.touchMeta();
  }

  reset(): void {
    this.config = structuredClone(defaultOnboardingConfig);
    this.touchMeta();
  }

  saveDraft(): void {
    this.touchMeta();
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(this.config));
  }

  loadDraft(): boolean {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) {
      return false;
    }

    try {
      const parsed = JSON.parse(raw) as OnboardingConfig;
      this.config = structuredClone(parsed);
      this.touchMeta();
      return true;
    } catch {
      return false;
    }
  }

  hasDraft(): boolean {
    return Boolean(localStorage.getItem(DRAFT_STORAGE_KEY));
  }

  clearDraft(): void {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  }

  getNextRoute(currentRoute: string): string {
    const index = this.steps.indexOf(currentRoute);
    if (index === -1 || index === this.steps.length - 1) {
      return '/onboarding/review';
    }

    return this.steps[index + 1];
  }

  getPreviousRoute(currentRoute: string): string {
    const index = this.steps.indexOf(currentRoute);
    if (index <= 0) {
      return '/dashboard';
    }

    return this.steps[index - 1];
  }

  getActiveStepIndex(route: string): number {
    return this.steps.indexOf(route);
  }

  authType(authType: AuthType): AuthConfig {
    switch (authType) {
      case 'basic':
        return { type: 'basic', username: '', password: '' };
      case 'bearer':
        return { type: 'bearer', token: '' };
      case 'oauth2':
        return {
          type: 'oauth2',
          tokenUrl: '',
          clientId: '',
          clientSecret: '',
          scopes: ''
        };
      case 'apiKey':
        return {
          type: 'apiKey',
          keyName: '',
          keyValue: '',
          placement: 'header'
        };
      case 'none':
      default:
        return { type: 'none' };
    }
  }

  private touchMeta(): void {
    if (!this.config.meta.draftId) {
      this.config.meta.draftId = crypto.randomUUID();
    }

    this.config.meta.updatedAt = new Date().toISOString();
  }
}
