import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { KeyValuePair } from '@app/models/key-value-pair';
import { UiService } from '@app/core/services/ui.service';

export interface CanDeactivateComponent {
  canDeactivate(): Promise<boolean>;
}

export class ComponentBase implements CanDeactivateComponent {
  isDirty = false;

  public readonly ui = inject(UiService);
  public readonly router = inject(Router);

  onInputChange(value?: boolean): void {
    this.isDirty = value ?? true;
  }

  // Método do guard para verificar se há alterações não salvas
  canDeactivate(): Promise<boolean> {
    if (!this.isDirty) return Promise.resolve(true);

    return this.ui.dialog.confirm(
      'Unsaved changes!',
      'You have unsaved changes. Do you really want to leave?',
      {
        icon: 'pi pi-exclamation-triangle',
        acceptButtonProps: {
          label: 'Yes, leave',
          severity: 'primary',
        },
        rejectButtonProps: {
          label: 'Cancel',
          severity: 'secondary',
          outlined: true,
        },
      }
    );
  }

  getQuery(params: any): KeyValuePair[] {
    const ret = new Array<KeyValuePair>();
    Object.entries(params).forEach(([key, value]) => {
      if (value != null) ret.push({ Key: key, Value: value });
    });

    return ret;
  }

  handleError(reason: any, callback?: () => void, router?: Router, showAlert = true) {
    if (!reason) return;

    if (this.handleValidationError(reason, callback)) return;
    if (this.handleUnauthorized(reason, router)) return;
    if (this.handleServerError(reason, callback)) return;
    if (this.handleNotFoundError(reason, callback, showAlert)) return;
    if (this.handleNotAcceptableError(reason, callback, showAlert)) return;

    this.ui.toast.error('Oops!', reason.message || reason.error?.detail || 'Unknown error');
  }

  handleAuthError = (err: HttpErrorResponse) => {
    const info = this.classifyAuthError(err);

    this.router.navigate(['/ops/error'], {
      queryParams: {
        code: info.code,
        title: info.title,
        detail: info.detail,
      },
      replaceUrl: true,
    });
  };

  private handleUnauthorized(reason: any, router?: Router): boolean {
    if (reason.unauthorized) {
      this.ui.dialog.alert('Attention!', 'Your session has expired, you will be redirected!').then(() => {
        if (router) router.navigate(['/auth']);
      });
      return true;
    }
    return false;
  }

  private handleServerError(reason: any, callback?: () => void): boolean {
    if (reason.error && reason.status == 500) {
      this.ui.toast.error(
        'Oops!',
        'We encountered a failure while trying to perform this operation at the moment.'
      );
      return true;
    }
    return false;
  }

  private handleNotFoundError(reason: any, callback?: () => void, showAlert = true): boolean {
    if (reason.status == 404 && showAlert) {
      this.ui.toast.warn('Warning', 'No records found.');
      return true;
    }
    return false;
  }

  private handleNotAcceptableError(reason: any, callback?: () => void, showAlert = true): boolean {
    if (reason.status == 406 && showAlert) {
      const detailMessage = reason.error?.detail || reason.detail;
      if (detailMessage) {
        this.ui.toast.warn('Warning', detailMessage);
        return true;
      }
    }
    return false;
  }

  private handleValidationError(reason: any, callback?: () => void): boolean {
    if (reason.error && reason.status == 422) {
      const errors = reason.error.errors;
      let errorMessage = '';

      errorMessage = '<ul>';
      for (const key in errors) {
        if (errors.hasOwnProperty(key)) {
          errors[key].forEach((msg: string) => {
            errorMessage += `<li>${msg}</li>`;
          });
        }
      }
      errorMessage += '</ul>';
      this.ui.toast.warn(
        'Check the information below:',
        `<div style="text-align: justify; margin-left: 7rem;">${errorMessage}</div>`
      );

      return true;
    }
    return false;
  }

  private classifyAuthError(err: HttpErrorResponse): {
    code: string;
    title: string;
    detail: string;
  } {
    if (err.status === 0) {
      const msg = (err.message || '') + ' ' + (err.statusText || '');
      const refused = /ERR_CONNECTION_REFUSED|CONNECTION_REFUSED|NS_ERROR_CONNECTION_REFUSED/i.test(
        msg
      );
      const reset = /ERR_CONNECTION_RESET|CONNECTION_RESET/i.test(msg);

      if (!navigator.onLine) {
        return {
          code: 'OFFLINE',
          title: 'No internet connection',
          detail: 'Check your connection and try again.',
        };
      } else if (refused) {
        return {
          code: 'CONNECTION_REFUSED',
          title: 'Authentication service unavailable',
          detail:
            'Could not connect to the authentication server. Please try again in a few moments.',
        };
      } else if (reset) {
        return {
          code: 'CONNECTION_RESET',
          title: 'Connection interrupted',
          detail: 'The connection to the server was interrupted. Try again.',
        };
      } else {
        return {
          code: 'NETWORK_ERROR',
          title: 'Network failure',
          detail: 'A network problem occurred while contacting the server. Try again.',
        };
      }
    }

    if (err.status === 400) {
      const desc =
        err.error?.error_description || 'Invalid request to the authentication server.';
      return { code: 'BAD_REQUEST', title: 'Invalid request', detail: desc };
    }
    if (err.status === 401 || err.status === 403) {
      return {
        code: 'UNAUTHORIZED',
        title: 'Unauthorized',
        detail: 'Invalid or expired credentials.',
      };
    }
    if (err.status >= 500) {
      return {
        code: 'SERVER_ERROR',
        title: 'Authentication server error',
        detail: 'Try again later.',
      };
    }

    return {
      code: 'UNKNOWN',
      title: 'Unknown error',
      detail: 'An unexpected error occurred during authentication.',
    };
  }
}

