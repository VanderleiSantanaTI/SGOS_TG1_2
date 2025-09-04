import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private authService: AuthService
  ) {
    this.loginForm = this.createForm();
  }

  ngOnInit() {}

  private createForm(): FormGroup {
    return this.formBuilder.group({
      username: ['admin', [Validators.required]],
      password: ['admin123', [Validators.required]]
    });
  }

  async onLogin() {
    if (this.loginForm.valid) {
      this.loading = true;

      try {
        const credentials = this.loginForm.value;
        
        // Use AuthService for login
        const response = await this.authService.login(credentials).toPromise();
        
        console.log('Login response:', response);
        
        if (response && (response.status === 'success' || response.success)) {
          await this.showSuccessToast('Login realizado com sucesso!');
          
          // Navigate to dashboard
          await this.router.navigate(['/dashboard']);
        } else {
          throw new Error(response?.message || 'Erro no login');
        }
      } catch (error: any) {
        console.error('Login error:', error);
        await this.showErrorToast(error.message || 'Erro ao fazer login');
      } finally {
        this.loading = false;
      }
    }
  }

  async quickLogin(role: 'admin' | 'mecanico' | 'supervisor' | 'usuario') {
    const credentials = {
      admin: { username: 'admin', password: 'admin123' },
      mecanico: { username: 'mecanico1', password: 'mecanico123' },
      supervisor: { username: 'supervisor', password: 'supervisor123' },
      usuario: { username: 'usuario', password: 'usuario123' }
    };

    this.loginForm.patchValue(credentials[role]);
    await this.onLogin();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
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

  getErrorMessage(controlName: string): string {
    return '';
  }

  hasError(controlName: string): boolean {
    return false;
  }
}
