import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TabsComponent, TabItem } from '../../components/tabs/tabs';
import { ToastComponent } from '../../components/toast/toast';
import { OnboardingStateService } from '../../services/onboarding-state.service';
import { AuthType, FormatType, KeyValuePair, MAPPING_TEMPLATES, MappingTemplate } from '../../models/onboarding.model';

type TabId = 'format' | 'auth' | 'request' | 'mapping' | 'review';

@Component({
    selector: 'app-onboarding-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TabsComponent, ToastComponent],
    templateUrl: './onboarding-page.html',
    styleUrl: './onboarding-page.scss'
})
export class OnboardingPageComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly state = inject(OnboardingStateService);

    activeTab: TabId = 'format';
    toastMessage = '';
    toastType: 'success' | 'error' | 'info' = 'success';
    toastVisible = false;

    readonly tabs: TabItem[] = [
        { id: 'format', label: 'Format' },
        { id: 'auth', label: 'Auth' },
        { id: 'request', label: 'Request' },
        { id: 'mapping', label: 'Mapping' },
        { id: 'review', label: 'Review' }
    ];

    // Customer header form
    readonly customerForm = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(80)]],
        environment: ['dev', Validators.required]
    });

    // Format form
    readonly formatForm = this.fb.group({
        type: ['json', Validators.required],
        schemaOrSample: ['', Validators.required]
    });
    formatError = '';

    // Auth form
    readonly authForm = this.fb.group({
        type: ['none', Validators.required],
        username: [''],
        password: [''],
        token: [''],
        tokenUrl: [''],
        clientId: [''],
        clientSecret: [''],
        scopes: [''],
        keyName: [''],
        keyValue: [''],
        placement: ['header']
    });

    // Request form
    readonly requestForm = this.fb.group({
        baseUrl: ['', Validators.required],
        endpoint: ['/orders/status', Validators.required],
        method: ['POST', Validators.required],
        timeoutMs: [10000, [Validators.required, Validators.min(1000)]],
        headers: this.fb.array([]),
        queryParams: this.fb.array([])
    });

    // Mapping form
    readonly mappingForm = this.fb.group({
        templateId: ['order-status-standard', Validators.required]
    });

    readonly mappingTemplates = MAPPING_TEMPLATES;

    ngOnInit(): void {
        this.loadFromState();
        this.authForm.controls.type.valueChanges.subscribe(() => this.applyAuthValidators());
        this.applyAuthValidators();
    }

    private loadFromState(): void {
        const config = this.state.getConfig();

        this.customerForm.patchValue(config.customer);
        this.formatForm.patchValue(config.format);
        this.authForm.patchValue({ ...config.auth });

        this.requestForm.patchValue({
            baseUrl: config.api.baseUrl,
            endpoint: config.api.endpoint,
            method: config.api.method,
            timeoutMs: config.api.timeoutMs
        });

        this.headers.clear();
        config.api.headers.forEach(h => this.headers.push(this.createPair(h)));

        this.queryParams.clear();
        config.api.queryParams.forEach(q => this.queryParams.push(this.createPair(q)));

        this.mappingForm.patchValue({ templateId: config.mappingTemplateId });
    }

    // ─────────────────────────────────────────────────────────────
    // Tab Navigation
    // ─────────────────────────────────────────────────────────────
    onTabChange(tabId: string): void {
        const nextTab = tabId as TabId;
        const currentIndex = this.tabs.findIndex(t => t.id === this.activeTab);
        const nextIndex = this.tabs.findIndex(t => t.id === nextTab);

        // Only enforce current-step validation when moving forward.
        if (nextIndex > currentIndex && !this.validateCurrentTab()) {
            return;
        }

        this.persistCurrentTab();
        this.activeTab = nextTab;
    }

    goNext(): void {
        if (!this.validateCurrentTab()) return;
        this.persistCurrentTab();

        const currentIndex = this.tabs.findIndex(t => t.id === this.activeTab);
        if (currentIndex < this.tabs.length - 1) {
            this.activeTab = this.tabs[currentIndex + 1].id as TabId;
        }
    }

    goPrevious(): void {
        this.persistCurrentTab();
        const currentIndex = this.tabs.findIndex(t => t.id === this.activeTab);
        if (currentIndex > 0) {
            this.activeTab = this.tabs[currentIndex - 1].id as TabId;
        }
    }

    private validateCurrentTab(): boolean {
        if (!this.validateCustomerSection()) {
            return false;
        }

        switch (this.activeTab) {
            case 'format':
                if (this.formatForm.invalid) {
                    this.formatForm.markAllAsTouched();
                    return false;
                }
                return this.validateFormatSyntax();
            case 'auth':
                if (this.authForm.invalid) {
                    this.authForm.markAllAsTouched();
                    return false;
                }
                return true;
            case 'request':
                if (this.requestForm.invalid) {
                    this.requestForm.markAllAsTouched();
                    return false;
                }
                return true;
            case 'mapping':
                if (this.mappingForm.invalid) {
                    this.mappingForm.markAllAsTouched();
                    return false;
                }
                return true;
            default:
                return true;
        }
    }

    private validateCustomerSection(): boolean {
        if (this.customerForm.invalid) {
            this.customerForm.markAllAsTouched();
            this.showToast('Please complete customer details before proceeding.', 'error');
            return false;
        }

        return true;
    }

    private validateAllSections(): boolean {
        if (!this.validateCustomerSection()) {
            return false;
        }

        if (this.formatForm.invalid || !this.validateFormatSyntax()) {
            this.formatForm.markAllAsTouched();
            this.activeTab = 'format';
            return false;
        }

        if (this.authForm.invalid) {
            this.authForm.markAllAsTouched();
            this.activeTab = 'auth';
            return false;
        }

        if (this.requestForm.invalid) {
            this.requestForm.markAllAsTouched();
            this.activeTab = 'request';
            return false;
        }

        if (this.mappingForm.invalid) {
            this.mappingForm.markAllAsTouched();
            this.activeTab = 'mapping';
            return false;
        }

        return true;
    }

    private persistCurrentTab(): void {
        this.state.updateCustomer(this.customerForm.getRawValue() as { name: string; environment: 'dev' | 'uat' | 'prod' });

        switch (this.activeTab) {
            case 'format':
                this.state.updateFormat(this.formatForm.getRawValue() as { type: FormatType; schemaOrSample: string });
                break;
            case 'auth':
                this.persistAuth();
                break;
            case 'request':
                this.persistRequest();
                break;
            case 'mapping':
                this.persistMapping();
                break;
        }
    }

    private persistAllSections(): void {
        this.state.updateCustomer(this.customerForm.getRawValue() as { name: string; environment: 'dev' | 'uat' | 'prod' });
        this.state.updateFormat(this.formatForm.getRawValue() as { type: FormatType; schemaOrSample: string });
        this.persistAuth();
        this.persistRequest();
        this.persistMapping();
    }

    // ─────────────────────────────────────────────────────────────
    // Format Tab
    // ─────────────────────────────────────────────────────────────
    validateFormatSyntax(): boolean {
        const payload = this.formatForm.controls.schemaOrSample.value ?? '';
        const type = (this.formatForm.controls.type.value ?? 'json') as FormatType;

        if (!payload.trim()) {
            this.formatError = 'Sample payload is required.';
            return false;
        }

        if (type === 'json') {
            try {
                JSON.parse(payload);
                this.formatError = '';
                return true;
            } catch {
                this.formatError = 'Invalid JSON format.';
                return false;
            }
        }

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(payload, 'application/xml');
        if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
            this.formatError = 'Invalid XML format.';
            return false;
        }

        this.formatError = '';
        return true;
    }

    // ─────────────────────────────────────────────────────────────
    // Auth Tab
    // ─────────────────────────────────────────────────────────────
    get authType(): AuthType {
        return (this.authForm.controls.type.value ?? 'none') as AuthType;
    }

    private applyAuthValidators(): void {
        const type = this.authType;
        const controls = this.authForm.controls;

        // Clear all validators
        controls.username.clearValidators();
        controls.password.clearValidators();
        controls.token.clearValidators();
        controls.tokenUrl.clearValidators();
        controls.clientId.clearValidators();
        controls.clientSecret.clearValidators();
        controls.keyName.clearValidators();
        controls.keyValue.clearValidators();

        // Apply based on type
        if (type === 'basic') {
            controls.username.setValidators([Validators.required]);
            controls.password.setValidators([Validators.required]);
        }
        if (type === 'bearer') {
            controls.token.setValidators([Validators.required]);
        }
        if (type === 'oauth2') {
            controls.tokenUrl.setValidators([Validators.required]);
            controls.clientId.setValidators([Validators.required]);
            controls.clientSecret.setValidators([Validators.required]);
        }
        if (type === 'apiKey') {
            controls.keyName.setValidators([Validators.required]);
            controls.keyValue.setValidators([Validators.required]);
        }

        Object.values(controls).forEach(c => c.updateValueAndValidity({ emitEvent: false }));
    }

    private persistAuth(): void {
        const type = this.authType;
        const v = this.authForm.getRawValue();

        switch (type) {
            case 'basic':
                this.state.updateAuth({ type, username: v.username ?? '', password: v.password ?? '' });
                break;
            case 'bearer':
                this.state.updateAuth({ type, token: v.token ?? '' });
                break;
            case 'oauth2':
                this.state.updateAuth({ type, tokenUrl: v.tokenUrl ?? '', clientId: v.clientId ?? '', clientSecret: v.clientSecret ?? '', scopes: v.scopes ?? '' });
                break;
            case 'apiKey':
                this.state.updateAuth({ type, keyName: v.keyName ?? '', keyValue: v.keyValue ?? '', placement: (v.placement ?? 'header') as 'header' | 'query' });
                break;
            default:
                this.state.updateAuth({ type: 'none' });
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Request Tab
    // ─────────────────────────────────────────────────────────────
    get headers(): FormArray {
        return this.requestForm.controls.headers;
    }

    get queryParams(): FormArray {
        return this.requestForm.controls.queryParams;
    }

    addHeader(): void {
        this.headers.push(this.createPair());
    }

    removeHeader(index: number): void {
        this.headers.removeAt(index);
    }

    addQueryParam(): void {
        this.queryParams.push(this.createPair());
    }

    removeQueryParam(index: number): void {
        this.queryParams.removeAt(index);
    }

    private createPair(pair?: KeyValuePair): FormGroup {
        return this.fb.group({
            key: [pair?.key ?? ''],
            value: [pair?.value ?? '']
        });
    }

    private persistRequest(): void {
        const v = this.requestForm.getRawValue();
        this.state.updateApi({
            baseUrl: v.baseUrl ?? '',
            endpoint: v.endpoint ?? '',
            method: (v.method ?? 'POST') as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
            timeoutMs: Number(v.timeoutMs ?? 10000),
            headers: this.extractPairs(this.headers),
            queryParams: this.extractPairs(this.queryParams)
        });
    }

    private extractPairs(array: FormArray): KeyValuePair[] {
        return array.controls
            .map(c => c.getRawValue() as KeyValuePair)
            .map(p => ({ key: (p.key ?? '').trim(), value: (p.value ?? '').trim() }))
            .filter(p => p.key || p.value);
    }

    // ─────────────────────────────────────────────────────────────
    // Mapping Tab
    // ─────────────────────────────────────────────────────────────
    get selectedTemplate(): MappingTemplate | undefined {
        const templateId = this.mappingForm.controls.templateId.value;
        return MAPPING_TEMPLATES.find(t => t.id === templateId);
    }

    private persistMapping(): void {
        const templateId = this.mappingForm.controls.templateId.value ?? 'order-status-standard';
        this.state.updateMappingTemplate(templateId);
    }

    // ─────────────────────────────────────────────────────────────
    // Review Tab & Actions
    // ─────────────────────────────────────────────────────────────
    get config() {
        return this.state.getConfig();
    }

    get configPreview(): string {
        return JSON.stringify(this.config, null, 2);
    }

    saveDraft(): void {
        this.persistCurrentTab();
        this.state.saveDraft();
        this.showToast('Draft saved successfully!', 'success');
    }

    submit(): void {
        if (!this.validateAllSections()) {
            this.showToast('Please fix validation errors before finishing.', 'error');
            return;
        }

        this.persistAllSections();
        this.state.saveDraft();
        this.router.navigateByUrl('/onboarding/success');
    }

    copyConfig(): void {
        navigator.clipboard.writeText(this.configPreview).then(() => {
            this.showToast('Config copied to clipboard!', 'success');
        });
    }

    goBack(): void {
        this.router.navigateByUrl('/dashboard');
    }

    private showToast(message: string, type: 'success' | 'error' | 'info'): void {
        this.toastMessage = message;
        this.toastType = type;
        this.toastVisible = true;
        setTimeout(() => (this.toastVisible = false), 3000);
    }
}
