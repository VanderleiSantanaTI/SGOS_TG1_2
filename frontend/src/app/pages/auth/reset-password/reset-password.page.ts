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
        await this.authService.resetPassword(token, password).toPromise();
        
        await this.showSuccessToast('Senha redefinida com sucesso!');
        this.router.navigate(['/login']);
      } catch (error: any) {
        await this.showErrorToast(error.message || 'Erro ao redefinir senha');
      } finally {
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
    this.router.navigate(['/login']);
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
