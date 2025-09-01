import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Erro desconhecido';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Erro: ${error.error.message}`;
        } else {
          // Server-side error
          switch (error.status) {
            case 400:
              errorMessage = error.error?.message || 'Dados inválidos';
              break;
            case 401:
              errorMessage = 'Sessão expirada. Faça login novamente.';
              this.handleUnauthorized();
              break;
            case 403:
              errorMessage = 'Acesso negado. Você não tem permissão para esta operação.';
              break;
            case 404:
              errorMessage = 'Recurso não encontrado';
              break;
            case 422:
              errorMessage = this.handleValidationError(error);
              break;
            case 429:
              errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';
              break;
            case 500:
              errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
              break;
            case 503:
              errorMessage = 'Serviço temporariamente indisponível';
              break;
            default:
              errorMessage = error.error?.message || `Erro ${error.status}: ${error.statusText}`;
          }
        }

        // Show error toast for non-auth endpoints
        if (error.status !== 401 && !request.url.includes('/auth/')) {
          this.showErrorToast(errorMessage);
        }

        console.error('HTTP Error:', error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private handleUnauthorized(): void {
    // Logout user and redirect to login
    this.authService.logout();
  }

  private handleValidationError(error: HttpErrorResponse): string {
    if (error.error?.details && Array.isArray(error.error.details)) {
      const messages = error.error.details.map((detail: any) => detail.message);
      return messages.join(', ');
    }
    return error.error?.message || 'Erro de validação';
  }

  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000,
      position: 'top',
      color: 'danger',
      buttons: [
        {
          text: 'Fechar',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
