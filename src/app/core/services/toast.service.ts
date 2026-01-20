import { Injectable, signal } from '@angular/core';

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    dismissible?: boolean;
    action?: {
        label: string;
        callback: () => void;
    };
}

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    private toasts = signal<Toast[]>([]);
    private idCounter = 0;

    getToasts = this.toasts.asReadonly();

    show(toast: Omit<Toast, 'id'>): string {
        const id = `toast-${++this.idCounter}`;
        const newToast: Toast = {
            id,
            duration: 5000,
            dismissible: true,
            ...toast,
        };

        this.toasts.update(toasts => [...toasts, newToast]);

        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => this.dismiss(id), newToast.duration);
        }

        return id;
    }

    success(title: string, message: string, duration?: number): string {
        return this.show({ type: 'success', title, message, duration });
    }

    error(title: string, message: string, duration?: number): string {
        return this.show({ type: 'error', title, message, duration: duration || 7000 });
    }

    warning(title: string, message: string, duration?: number): string {
        return this.show({ type: 'warning', title, message, duration });
    }

    info(title: string, message: string, duration?: number): string {
        return this.show({ type: 'info', title, message, duration });
    }

    dismiss(id: string): void {
        this.toasts.update(toasts => toasts.filter(t => t.id !== id));
    }

    dismissAll(): void {
        this.toasts.set([]);
    }
}
