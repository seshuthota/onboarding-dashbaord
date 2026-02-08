import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    @if (visible) {
      <div class="toast" [class]="'toast--' + type" role="alert">
        <span class="toast__icon">
          @switch (type) {
            @case ('success') { ✓ }
            @case ('error') { ✕ }
            @default { ℹ }
          }
        </span>
        <span class="toast__message">{{ message }}</span>
        <button type="button" class="toast__close" (click)="close()" aria-label="Close">×</button>
      </div>
    }
  `,
    styles: [`
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      animation: slideUp 0.3s ease-out;
      z-index: 1000;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(1rem);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .toast--success {
      border-color: var(--success);
    }

    .toast--error {
      border-color: var(--error);
    }

    .toast__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .toast--success .toast__icon {
      background: var(--success-bg);
      color: var(--success);
    }

    .toast--error .toast__icon {
      background: var(--error-bg);
      color: var(--error);
    }

    .toast--info .toast__icon {
      background: rgba(102, 126, 234, 0.1);
      color: var(--accent-primary);
    }

    .toast__message {
      color: var(--text-primary);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .toast__close {
      margin-left: 0.5rem;
      padding: 0;
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.25rem;
      cursor: pointer;
      transition: color var(--transition-fast);
    }

    .toast__close:hover {
      color: var(--text-primary);
    }
  `]
})
export class ToastComponent {
    @Input() message = '';
    @Input() type: 'success' | 'error' | 'info' = 'info';
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();

    close(): void {
        this.visible = false;
        this.visibleChange.emit(false);
    }
}
