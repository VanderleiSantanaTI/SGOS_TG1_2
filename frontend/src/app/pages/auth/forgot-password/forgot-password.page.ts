import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  forgotPasswordForm: FormGroup;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.forgotPasswordForm = this.createForm();
  }

  ngOnInit() {}

  private createForm(): FormGroup {
    return this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      const loading = await this.loadingController.create({
        message: 'Enviando...',
        duration: 10000
      });
      await loading.present();

      try {
        const email = this.forgotPasswordForm.get('email')?.value;
        await this.authService.requestPasswordReset(email).toPromise();
        
        await this.showSuccessToast('Se o email estiver cadastrado, você receberá um código de recuperação.');
        this.router.navigate(['/reset-password']);
      } catch (error: any) {
        await this.showErrorToast(error.message || 'Erro ao solicitar recuperação');
      } finally {
        this.loading = false;
        await loading.dismiss();
      }
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
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
