import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  resetPasswordForm: FormGroup;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.resetPasswordForm = this.createForm();
  }

  ngOnInit() {}

  private createForm(): FormGroup {
    return this.formBuilder.group({
      token: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    return null;
  }

  async onSubmit() {
    if (this.resetPasswordForm.valid) {
      this.loading = true;
      const loading = await this.loadingController.create({
        message: 'Redefinindo senha...',
        duration: 10000
      });
      await loading.present();

      try {
        const { token, password } = this.resetPasswordForm.value;
        
        // Usar subscribe em vez de toPromise() para melhor tratamento de erro
        this.authService.resetPassword(token, password).subscribe({
          next: async (response: any) => {
            // Verificar se a resposta é realmente de sucesso
            if (response && (response.status === 'success' || response.success)) {
              await this.showSuccessToast('Senha redefinida com sucesso!');
              this.router.navigate(['/login']);
            } else {
              // Se não é sucesso, tratar como erro
              const errorMessage = response?.message || 'Erro ao redefinir senha';
              await this.showErrorToast(errorMessage);
            }
          },
          error: async (error: any) => {
            console.error('Erro na redefinição de senha:', error);
            let errorMessage = 'Erro ao redefinir senha';
            
            // Extrair mensagem de erro da resposta
            if (error?.error?.message) {
              errorMessage = error.error.message;
            } else if (error?.message) {
              errorMessage = error.message;
            }
            
            await this.showErrorToast(errorMessage);
          },
          complete: () => {
            this.loading = false;
            loading.dismiss();
          }
        });
        
      } catch (error: any) {
        console.error('Erro inesperado:', error);
        await this.showErrorToast('Erro inesperado ao redefinir senha');
        this.loading = false;
        await loading.dismiss();
      }
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin() {
    console.log('Navegando para login...');
    // Forçar navegação para a rota raiz que redireciona para login
    this.router.navigateByUrl('/').then(() => {
      console.log('Navegação para login concluída');
    }).catch(error => {
      console.error('Erro ao navegar para login:', error);
      // Fallback: tentar navegar diretamente para /login
      this.router.navigate(['/login']);
    });
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'success'
    });
    await toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }
}
