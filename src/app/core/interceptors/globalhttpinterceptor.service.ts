import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoadingService } from '../services/loading.service';
import { UiService } from '../services/ui.service';

export const globalHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const uiService = inject(UiService);

  loadingService.show();

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      loadingService.hide();

      let errorMessage = 'An unknown error occurred';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Invalid request';
            break;
          case 401:
            errorMessage = 'Unauthorized. Please login again.';
            break;
          case 403:
            errorMessage = 'Access denied';
            break;
          case 404:
            errorMessage = 'Resource not found';
            break;
          case 500:
            errorMessage = 'Internal server error';
            break;
          default:
            errorMessage = `Error: ${error.message}`;
        }
      }

      uiService.toast.error('Error', errorMessage);
      return throwError(() => error);
    })
  );
};

