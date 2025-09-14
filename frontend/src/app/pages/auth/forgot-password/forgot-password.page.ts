import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  forgotPasswordForm: FormGroup;
  loading = false;
  checkingEmail = false;
  emailExists = false;
  emailChecked = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.forgotPasswordForm = this.createForm();
  }

  ngOnInit() {
    // Verificar email quando o usuário parar de digitar
    this.forgotPasswordForm.get('email')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(email => email && email.length > 0 && this.isValidEmail(email))
      )
      .subscribe(email => {
        this.checkEmailExists(email);
      });
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async checkEmailExists(email: string) {
    this.checkingEmail = true;
    this.emailChecked = false;
    
    try {
      const response: any = await this.authService.checkEmailExists(email).toPromise();
      
      if (response && response.status === 'success') {
        // Ajustar para a estrutura real da resposta do backend
        this.emailExists = response.message?.exists || response.data?.exists || false;
        this.emailChecked = true;
        console.log('Email verificado:', { email, exists: this.emailExists, response });
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      this.emailExists = false;
      this.emailChecked = true;
    } finally {
      this.checkingEmail = false;
    }
  }

  async onSubmit() {
    if (this.forgotPasswordForm.valid) {
      // Verificar se o email foi verificado e existe
      if (!this.emailChecked) {
        await this.showErrorToast('Aguarde a verificação do email');
        return;
      }

      if (!this.emailExists) {
        await this.showErrorToast('Email não encontrado em nossa base de dados');
        return;
      }

      this.loading = true;
      const loading = await this.loadingController.create({
        message: 'Enviando código de recuperação...',
        duration: 10000
      });
      await loading.present();

      try {
        const email = this.forgotPasswordForm.get('email')?.value;
        const response: any = await this.authService.requestPasswordReset(email).toPromise();
        
        if (response && response.status === 'success') {
          await this.showSuccessToast(response.data || 'Código de recuperação enviado para seu email com sucesso!');
          this.router.navigate(['/reset-password']);
        } else {
          throw new Error(response?.message || 'Erro ao solicitar recuperação');
        }
      } catch (error: any) {
        console.error('Erro na recuperação de senha:', error);
        await this.showErrorToast(error.message || 'Erro ao solicitar recuperação');
      } finally {
        this.loading = false;
        await loading.dismiss();
      }
    }
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

  getEmailItemClass(): string {
    if (this.checkingEmail) {
      return 'checking';
    }
    if (this.emailChecked && this.emailExists) {
      return 'success';
    }
    if (this.emailChecked && !this.emailExists) {
      return 'error';
    }
    return '';
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
