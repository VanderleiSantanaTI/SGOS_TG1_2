import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuController, ToastController, AlertController, LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../../models/usuario.model';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {
  @ViewChild('usuarioModal', { static: false }) usuarioModal: any;

  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  loading = false;
  isModalOpen = false;
  isEditing = false;
  currentUsuario: Usuario | null = null;

  usuarioForm: FormGroup;
  perfilOptions = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'SUPERVISOR', label: 'Supervisor' },
    { value: 'MECANICO', label: 'Mecânico' },
    { value: 'USUARIO', label: 'Usuário' }
  ];

  constructor(
    private menuController: MenuController,
    private usuarioService: UsuarioService,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.usuarioForm = this.createForm();
  }

  ngOnInit() {
    this.loadUsuarios();
  }

  async openMenu() {
    await this.menuController.open();
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      nome_completo: ['', [Validators.required, Validators.minLength(2)]],
      perfil: ['USUARIO', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      ativo: [true]
    });
  }

  async loadUsuarios() {
    this.loading = true;
    try {
      const response = await this.usuarioService.getUsuarios({
        skip: (this.currentPage - 1) * this.pageSize,
        limit: this.pageSize,
        search: this.searchTerm || undefined
      }).toPromise();

      if (response) {
        this.usuarios = response.data.items || [];
        this.filteredUsuarios = [...this.usuarios];
        this.totalPages = response.data.pages || 1;
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      await this.showErrorToast('Erro ao carregar usuários');
    } finally {
      this.loading = false;
    }
  }

  onSearchChange() {
    this.currentPage = 1;
    this.loadUsuarios();
  }

  async openCreateModal() {
    this.isEditing = false;
    this.currentUsuario = null;
    this.usuarioForm.reset();
    this.usuarioForm.patchValue({
      perfil: 'USUARIO',
      ativo: true
    });
    this.isModalOpen = true;
  }

  async openEditModal(usuario: Usuario) {
    this.isEditing = true;
    this.currentUsuario = usuario;
    this.usuarioForm.patchValue({
      username: usuario.username,
      email: usuario.email,
      nome_completo: usuario.nome_completo,
      perfil: usuario.perfil,
      ativo: usuario.ativo
    });
    // Remove validação de senha para edição
    this.usuarioForm.get('password')?.clearValidators();
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.isModalOpen = true;
  }

  async closeModal() {
    this.isModalOpen = false;
    this.usuarioForm.reset();
    this.currentUsuario = null;
  }

  async saveUsuario() {
    if (this.usuarioForm.invalid) {
      await this.showErrorToast('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const loading = await this.loadingController.create({
      message: this.isEditing ? 'Atualizando usuário...' : 'Criando usuário...'
    });
    await loading.present();

    try {
      const formData = this.usuarioForm.value;
      
      if (this.isEditing && this.currentUsuario) {
        // Para edição, não enviar senha se estiver vazia
        if (!formData.password) {
          delete formData.password;
        }
        await this.usuarioService.updateUsuario(this.currentUsuario.id, formData).toPromise();
        await this.showSuccessToast('Usuário atualizado com sucesso!');
      } else {
        await this.usuarioService.createUsuario(formData).toPromise();
        await this.showSuccessToast('Usuário criado com sucesso!');
      }

      await this.closeModal();
      await this.loadUsuarios();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      await this.showErrorToast(error.message || 'Erro ao salvar usuário');
    } finally {
      await loading.dismiss();
    }
  }

  async deleteUsuario(usuario: Usuario) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o usuário "${usuario.nome_completo}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Excluindo usuário...'
            });
            await loading.present();

            try {
              await this.usuarioService.deleteUsuario(usuario.id).toPromise();
              await this.showSuccessToast('Usuário excluído com sucesso!');
              await this.loadUsuarios();
            } catch (error: any) {
              console.error('Erro ao excluir usuário:', error);
              await this.showErrorToast(error.message || 'Erro ao excluir usuário');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async toggleUsuarioStatus(usuario: Usuario) {
    const loading = await this.loadingController.create({
      message: usuario.ativo ? 'Desativando usuário...' : 'Ativando usuário...'
    });
    await loading.present();

    try {
      await this.usuarioService.toggleUsuarioStatus(usuario.id).toPromise();
      await this.showSuccessToast(
        usuario.ativo ? 'Usuário desativado com sucesso!' : 'Usuário ativado com sucesso!'
      );
      await this.loadUsuarios();
    } catch (error: any) {
      console.error('Erro ao alterar status do usuário:', error);
      await this.showErrorToast(error.message || 'Erro ao alterar status do usuário');
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

  async previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      await this.loadUsuarios();
    }
  }

  async nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      await this.loadUsuarios();
    }
  }

  async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
}
