import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '@app/core/services/toast.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-toast-container',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toastService.getToasts()"
        class="toast"
        [class.toast-success]="toast.type === 'success'"
        [class.toast-error]="toast.type === 'error'"
        [class.toast-warning]="toast.type === 'warning'"
        [class.toast-info]="toast.type === 'info'"
        @slideIn
      >
        <div class="toast-icon">
          <svg *ngIf="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <svg *ngIf="toast.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <svg *ngIf="toast.type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <svg *ngIf="toast.type === 'info'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
          <button
            *ngIf="toast.action"
            class="toast-action"
            (click)="toast.action.callback(); toastService.dismiss(toast.id)"
          >
            {{ toast.action.label }}
          </button>
        </div>

        <button
          *ngIf="toast.dismissible"
          class="toast-close"
          (click)="toastService.dismiss(toast.id)"
          aria-label="Close notification"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 420px;
      width: 100%;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--neutral-white);
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      border-left: 4px solid;
      pointer-events: auto;
      animation: slideIn 0.3s ease;
    }

    .toast-success {
      border-left-color: var(--success);
      .toast-icon { color: var(--success); }
    }

    .toast-error {
      border-left-color: var(--error);
      .toast-icon { color: var(--error); }
    }

    .toast-warning {
      border-left-color: var(--warning);
      .toast-icon { color: var(--warning); }
    }

    .toast-info {
      border-left-color: var(--info);
      .toast-icon { color: var(--info); }
    }

    .toast-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--neutral-900);
      margin-bottom: 0.25rem;
    }

    .toast-message {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .toast-action {
      margin-top: 0.5rem;
      padding: 0.375rem 0.75rem;
      background: var(--primary-blue);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .toast-action:hover {
      background: var(--primary-blue-dark);
    }

    .toast-close {
      flex-shrink: 0;
      background: none;
      border: none;
      color: var(--neutral-400);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast-close:hover {
      background: var(--neutral-100);
      color: var(--neutral-600);
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 640px) {
      .toast-container {
        left: 1rem;
        right: 1rem;
        max-width: none;
      }
    }
  `],
    animations: [
        trigger('slideIn', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ])
    ]
})
export class ToastContainerComponent {
    toastService = inject(ToastService);
}
