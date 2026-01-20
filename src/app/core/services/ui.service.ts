import { Injectable, inject } from '@angular/core';
import { LoadingService } from './loading.service';
import { ToastService } from './toast.service';

export interface DialogOptions {
  icon?: string;
  acceptButtonProps?: {
    label: string;
    severity?: string;
  };
  rejectButtonProps?: {
    label: string;
    severity?: string;
    outlined?: boolean;
  };
}

@Injectable({
  providedIn: 'root',
})
export class UiService {
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);

  loading = {
    show: () => this.loadingService.show(),
    hide: () => this.loadingService.hide(),
    isLoading: () => this.loadingService.isLoading(),
  };

  dialog = {
    confirm: (title: string, message: string, options?: DialogOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        const confirmed = window.confirm(`${title}\n\n${message}`);
        resolve(confirmed);
      });
    },
    alert: (title: string, message: string): Promise<void> => {
      return new Promise((resolve) => {
        window.alert(`${title}\n\n${message}`);
        resolve();
      });
    },
  };

  toast = {
    success: (title: string, message: string, duration?: number): void => {
      this.toastService.success(title, message, duration);
    },
    error: (title: string, message: string, duration?: number): void => {
      this.toastService.error(title, message, duration);
    },
    warn: (title: string, message: string, duration?: number): void => {
      this.toastService.warning(title, message, duration);
    },
    info: (title: string, message: string, duration?: number): void => {
      this.toastService.info(title, message, duration);
    },
  };
}

