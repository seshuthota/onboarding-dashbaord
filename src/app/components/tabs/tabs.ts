import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabItem {
    id: string;
    label: string;
    icon?: string;
    isComplete?: boolean;
    hasError?: boolean;
}

@Component({
    selector: 'app-tabs',
    standalone: true,
    imports: [CommonModule],
    template: `
    <nav class="tabs" role="tablist">
      @for (tab of tabs; track tab.id; let i = $index) {
        <button
          type="button"
          role="tab"
          class="tab"
          [class.tab--active]="tab.id === activeTabId"
          [class.tab--complete]="tab.isComplete"
          [class.tab--error]="tab.hasError"
          [attr.aria-selected]="tab.id === activeTabId"
          [attr.aria-controls]="'panel-' + tab.id"
          (click)="selectTab(tab.id)"
        >
          <span class="tab__number">{{ i + 1 }}</span>
          <span class="tab__label">{{ tab.label }}</span>
          @if (tab.isComplete) {
            <span class="tab__check">✓</span>
          }
        </button>
      }
      <div class="tabs__indicator" [style.transform]="indicatorTransform"></div>
    </nav>
  `,
    styles: [`
    .tabs {
      display: flex;
      gap: 0.25rem;
      position: relative;
      padding: 0.5rem;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
    }

    .tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1rem;
      background: transparent;
      border: none;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      position: relative;
      z-index: 1;
    }

    .tab:hover:not(.tab--active) {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.05);
    }

    .tab--active {
      color: white;
    }

    .tab--complete .tab__number {
      background: var(--success);
    }

    .tab--error .tab__number {
      background: var(--error);
    }

    .tab__number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      background: var(--text-muted);
      border-radius: 50%;
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
      transition: background var(--transition-fast);
    }

    .tab--active .tab__number {
      background: white;
      color: var(--accent-primary);
    }

    .tab__label {
      display: none;
    }

    @media (min-width: 768px) {
      .tab__label {
        display: inline;
      }
    }

    .tab__check {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1rem;
      height: 1rem;
      background: var(--success);
      border-radius: 50%;
      font-size: 0.625rem;
      color: white;
    }

    .tabs__indicator {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      height: calc(100% - 1rem);
      width: calc((100% - 1rem) / var(--tab-count, 5));
      background: var(--accent-gradient);
      border-radius: var(--radius-md);
      transition: transform var(--transition-base);
      z-index: 0;
      box-shadow: var(--shadow-glow);
    }
  `]
})
export class TabsComponent {
    @Input({ required: true }) tabs: TabItem[] = [];
    @Input({ required: true }) activeTabId = '';
    @Output() tabChange = new EventEmitter<string>();

    get indicatorTransform(): string {
        const index = this.tabs.findIndex(t => t.id === this.activeTabId);
        return `translateX(${index * 100}%)`;
    }

    selectTab(tabId: string): void {
        this.tabChange.emit(tabId);
    }
}
