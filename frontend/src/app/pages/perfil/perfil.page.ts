import { Component, OnInit } from '@angular/core';
import { MenuController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  currentUser: Usuario | null = null;
  isEditing = false;
  isLoading = false;
  
  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  perfilOptions = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'SUPERVISOR', label: 'Supervisor' },
    { value: 'MECANICO', label: 'Mecânico' },
    { value: 'USUARIO', label: 'Usuário' }
  ];

  constructor(
    private menuController: MenuController,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    this.profileForm = this.createProfileForm();
    this.passwordForm = this.createPasswordForm();
  }

  ngOnInit() {
    this.loadCurrentUser();
  }

  async openMenu() {
    await this.menuController.open();
  }

  createProfileForm(): FormGroup {
    return this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      nome_completo: ['', [Validators.required, Validators.minLength(2)]],
      perfil: ['', [Validators.required]]
    });
  }

  createPasswordForm(): FormGroup {
    return this.formBuilder.group({
      senha_atual: ['', [Validators.required]],
      nova_senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmar_senha: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const nova_senha = form.get('nova_senha');
    const confirmar_senha = form.get('confirmar_senha');
    
    if (nova_senha && confirmar_senha && nova_senha.value !== confirmar_senha.value) {
      confirmar_senha.setErrors({ passwordMismatch: true });
    } else {
      if (confirmar_senha?.errors?.['passwordMismatch']) {
        delete confirmar_senha.errors['passwordMismatch'];
        if (Object.keys(confirmar_senha.errors).length === 0) {
          confirmar_senha.setErrors(null);
        }
      }
    }
    return null;
  }

  loadCurrentUser() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.populateForm();
    }
  }

  populateForm() {
    if (this.currentUser) {
      this.profileForm.patchValue({
        username: this.currentUser.username,
        email: this.currentUser.email,
        nome_completo: this.currentUser.nome_completo,
        perfil: this.currentUser.perfil
      });
    }
  }

  startEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
    this.populateForm();
  }

  async saveProfile() {
    if (this.profileForm.invalid) {
      await this.showErrorToast('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Salvando perfil...'
    });
    await loading.present();

    try {
      if (this.currentUser) {
        const formData = this.profileForm.value;
        
        const response = await this.usuarioService.updateUsuario(this.currentUser.id, formData).toPromise();
        
        if (response && response.success) {
          // Atualizar dados do usuário no AuthService
          if (this.currentUser) {
            const updatedUser = { ...this.currentUser, ...formData };
            this.currentUser = updatedUser;
            this.authService.updateCurrentUser(updatedUser);
          }
          
          await this.showSuccessToast('Perfil atualizado com sucesso!');
          this.isEditing = false;
        } else {
          throw new Error(response?.message || 'Erro ao atualizar perfil');
        }
      }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      await this.showErrorToast('Erro ao atualizar perfil: ' + (error.message || 'Erro desconhecido'));
    } finally {
      await loading.dismiss();
    }
  }

  async changePassword() {
    if (this.passwordForm.invalid) {
      await this.showErrorToast('Por favor, preencha todos os campos da senha');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Alterando senha...'
    });
    await loading.present();

    try {
      const passwordData = {
        senha_atual: this.passwordForm.value.senha_atual,
        nova_senha: this.passwordForm.value.nova_senha
      };

      // Fazer requisição direta para o endpoint de alterar senha
      const token = localStorage.getItem(environment.storage.token);
      const response: any = await fetch(`${environment.apiUrl}/usuarios/me/password/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });

      const result = await response.json();
      console.log('Password change response:', result);

      if (result && (result.success || result.status === 'success')) {
        await this.showSuccessToast('Senha alterada com sucesso!');
        this.passwordForm.reset();
      } else {
        // Se a resposta contém uma mensagem de sucesso mas não tem success/status, tratar como sucesso
        if (result?.message && result.message.includes('sucesso')) {
          await this.showSuccessToast('Senha alterada com sucesso!');
          this.passwordForm.reset();
        } else {
          throw new Error(result?.message || 'Erro ao alterar senha');
        }
      }
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      await this.showErrorToast('Erro ao alterar senha: ' + (error.message || 'Erro desconhecido'));
    } finally {
      await loading.dismiss();
    }
  }

  getPerfilLabel(perfil: string): string {
    const option = this.perfilOptions.find(opt => opt.value === perfil);
    return option ? option.label : perfil;
  }

  getPerfilColor(perfil: string): string {
    switch (perfil) {
      case 'ADMIN': return 'danger';
      case 'SUPERVISOR': return 'warning';
      case 'MECANICO': return 'primary';
      case 'USUARIO': return 'medium';
      default: return 'medium';
    }
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  }

  async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
}
