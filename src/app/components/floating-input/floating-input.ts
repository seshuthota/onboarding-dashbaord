import { Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-floating-input',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FloatingInputComponent),
            multi: true
        }
    ],
    template: `
    <div class="floating-group" [class.floating-group--focused]="isFocused" [class.floating-group--filled]="hasValue" [class.floating-group--error]="error">
      @if (type === 'textarea') {
        <textarea
          class="floating-input floating-textarea"
          [id]="inputId"
          [rows]="rows"
          [placeholder]="' '"
          [value]="value"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
        ></textarea>
      } @else if (type === 'select') {
        <select
          class="floating-input floating-select"
          [id]="inputId"
          [value]="value"
          (change)="onSelectChange($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
        >
          <ng-content></ng-content>
        </select>
      } @else {
        <input
          class="floating-input"
          [id]="inputId"
          [type]="type"
          [placeholder]="' '"
          [value]="value"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
        />
      }
      <label class="floating-label" [for]="inputId">{{ label }}</label>
      @if (error) {
        <span class="floating-error">{{ error }}</span>
      }
    </div>
  `,
    styles: [`
    .floating-group {
      position: relative;
      margin-bottom: 0.25rem;
    }

    .floating-input {
      width: 100%;
      padding: 1.25rem 1rem 0.5rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-family: inherit;
      font-size: 0.9375rem;
      transition: all var(--transition-fast);
    }

    .floating-input:hover {
      border-color: rgba(255, 255, 255, 0.15);
    }

    .floating-input:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }

    .floating-textarea {
      min-height: 120px;
      resize: vertical;
    }

    .floating-select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      padding-right: 2.5rem;
    }

    .floating-select option {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }

    .floating-label {
      position: absolute;
      top: 50%;
      left: 1rem;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 0.9375rem;
      pointer-events: none;
      transition: all var(--transition-fast);
    }

    .floating-textarea + .floating-label {
      top: 1.25rem;
      transform: none;
    }

    .floating-group--focused .floating-label,
    .floating-group--filled .floating-label,
    .floating-input:focus + .floating-label,
    .floating-input:not(:placeholder-shown) + .floating-label {
      top: 0.5rem;
      transform: none;
      font-size: 0.75rem;
      color: var(--accent-primary);
    }

    .floating-group--error .floating-input {
      border-color: var(--error);
    }

    .floating-group--error .floating-label {
      color: var(--error);
    }

    .floating-error {
      display: block;
      margin-top: 0.375rem;
      color: var(--error);
      font-size: 0.8125rem;
    }
  `]
})
export class FloatingInputComponent implements ControlValueAccessor {
    @Input() label = '';
    @Input() type: 'text' | 'password' | 'email' | 'url' | 'number' | 'textarea' | 'select' = 'text';
    @Input() error = '';
    @Input() rows = 4;

    value = '';
    isFocused = false;

    private static counter = 0;
    inputId = `floating-input-${++FloatingInputComponent.counter}`;

    private onChange: (value: string) => void = () => { };
    private onTouched: () => void = () => { };

    get hasValue(): boolean {
        return this.value !== '' && this.value !== null && this.value !== undefined;
    }

    writeValue(value: string): void {
        this.value = value ?? '';
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    onInput(event: Event): void {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement;
        this.value = target.value;
        this.onChange(this.value);
    }

    onSelectChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        this.value = target.value;
        this.onChange(this.value);
    }

    onFocus(): void {
        this.isFocused = true;
    }

    onBlur(): void {
        this.isFocused = false;
        this.onTouched();
    }
}
