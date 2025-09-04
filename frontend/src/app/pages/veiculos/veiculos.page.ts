import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, LoadingController, ToastController, AlertController, ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface Veiculo {
  id: number;
  marca: string;
  modelo: string;
  placa: string;
  su_cia_viatura: string;
  patrimonio: string;
  ano_fabricacao: string;
  cor: string;
  chassi: string;
  motor: string;
  combustivel: string;
  observacoes: string;
  status: 'ATIVO' | 'MANUTENCAO' | 'INATIVO';
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-veiculos',
  templateUrl: './veiculos.page.html',
  styleUrls: ['./veiculos.page.scss'],
})
export class VeiculosPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Configurações do environment
  environment = environment;
  
  veiculos: Veiculo[] = [];
  filteredVeiculos: Veiculo[] = [];
  currentUser: any = null;
  loading = false;
  searchTerm = '';
  selectedStatus = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Form properties
  showCreateForm = false;
  showEditForm = false;
  editingVeiculo: Veiculo | null = null;
  
  veiculoForm!: FormGroup;
  
  statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'ATIVO', label: 'Ativo' },
    { value: 'MANUTENCAO', label: 'Manutenção' },
    { value: 'INATIVO', label: 'Inativo' }
  ];

  combustivelOptions = [
    'Diesel',
    'Gasolina',
    'Flex',
    'Etanol',
    'GNV',
    'Elétrico',
    'Híbrido'
  ];

  ciaOptions = [
    '1ª Cia',
    '2ª Cia',
    '3ª Cia',
    '4ª Cia',
    '5ª Cia',
    '6ª Cia',
    '7ª Cia',
    '8ª Cia',
    '9ª Cia',
    '10ª Cia'
  ];

  constructor(
    private router: Router,
    private menuController: MenuController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController,
    private http: HttpClient,
    private formBuilder: FormBuilder
  ) {
    this.initializeForm();
  }

  /**
   * Initialize the vehicle form
   */
  initializeForm() {
    this.veiculoForm = this.formBuilder.group({
      marca: ['', [Validators.required, Validators.minLength(2)]],
      modelo: ['', [Validators.required, Validators.minLength(2)]],
      placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-[0-9]{4}$/)]],
      su_cia_viatura: ['', Validators.required],
      patrimonio: ['', [Validators.required, Validators.minLength(3)]],
      ano_fabricacao: ['', [Validators.required, Validators.pattern(/^[0-9]{4}$/)]],
      cor: ['', [Validators.required, Validators.minLength(2)]],
      chassi: ['', [Validators.required, Validators.minLength(17), Validators.maxLength(17)]],
      motor: ['', [Validators.required, Validators.minLength(2)]],
      combustivel: ['', Validators.required],
      observacoes: [''],
      status: ['ATIVO', Validators.required]
    });
  }

  ngOnInit() {
    // Get user from localStorage
    const userStr = localStorage.getItem('sgos_user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
    
    this.loadVeiculos();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load vehicles from API
   */
  async loadVeiculos() {
    this.loading = true;
    
    try {
      const token = localStorage.getItem(environment.storage.token);
      const options: any = {};
      
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }
      
      const response: any = await this.http.get(
        `${environment.apiUrl}${environment.endpoints.veiculos}/`, 
        options
      ).toPromise();
      
      console.log('Vehicles Response:', response);
      
      if (response && (response.status === 'success' || response.success) && response.data) {
        this.veiculos = response.data.items || [];
        this.totalItems = response.data.pagination?.total || this.veiculos.length;
        console.log('Loaded vehicles:', this.veiculos.length);
        this.applyFilters();
      } else {
        console.log('No vehicles data:', response);
        this.veiculos = [];
        this.applyFilters();
      }
    } catch (error: any) {
      console.error('Error loading vehicles:', error);
      await this.showErrorToast('Erro ao carregar veículos: ' + (error.message || 'Erro desconhecido'));
    } finally {
      this.loading = false;
    }
  }

  /**
   * Apply search and status filters
   */
  applyFilters() {
    this.filteredVeiculos = this.veiculos.filter(veiculo => {
      const matchesSearch = !this.searchTerm || 
        veiculo.marca.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        veiculo.modelo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        veiculo.placa.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        veiculo.patrimonio.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || veiculo.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  /**
   * Handle search input
   */
  onSearchChange(event: any) {
    this.searchTerm = event.target.value || '';
    this.applyFilters();
  }

  /**
   * Handle status filter change
   */
  onStatusChange(event: any) {
    this.selectedStatus = event.target.value || '';
    this.applyFilters();
  }

  /**
   * Handle pull-to-refresh
   */
  async onRefresh(event: any) {
    await this.loadVeiculos();
    event.target.complete();
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.currentUser?.perfil === 'ADMIN';
  }

  /**
   * Check if user can edit (admin or supervisor)
   */
  canEdit(): boolean {
    return this.currentUser?.perfil === 'ADMIN' || this.currentUser?.perfil === 'SUPERVISOR';
  }

  /**
   * Show create vehicle form
   */
  showCreateVeiculo() {
    if (!this.isAdmin()) {
      this.showErrorToast('Apenas administradores podem cadastrar veículos');
      return;
    }
    this.showCreateForm = true;
    this.showEditForm = false;
    this.editingVeiculo = null;
    this.resetForm();
  }

  /**
   * Show edit vehicle form
   */
  showEditVeiculo(veiculo: Veiculo) {
    if (!this.canEdit()) {
      this.showErrorToast('Você não tem permissão para editar veículos');
      return;
    }
    this.showEditForm = true;
    this.showCreateForm = false;
    this.editingVeiculo = veiculo;
    this.populateForm(veiculo);
  }

  /**
   * Hide forms
   */
  hideForms() {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.editingVeiculo = null;
    this.resetForm();
  }

  /**
   * Reset form to default values
   */
  resetForm() {
    this.veiculoForm.reset({
      marca: '',
      modelo: '',
      placa: '',
      su_cia_viatura: '',
      patrimonio: '',
      ano_fabricacao: '',
      cor: '',
      chassi: '',
      motor: '',
      combustivel: '',
      observacoes: '',
      status: 'ATIVO'
    });
  }

  /**
   * Populate form with vehicle data
   */
  populateForm(veiculo: Veiculo) {
    this.veiculoForm.patchValue({
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      placa: veiculo.placa,
      su_cia_viatura: veiculo.su_cia_viatura,
      patrimonio: veiculo.patrimonio,
      ano_fabricacao: veiculo.ano_fabricacao,
      cor: veiculo.cor,
      chassi: veiculo.chassi,
      motor: veiculo.motor,
      combustivel: veiculo.combustivel,
      observacoes: veiculo.observacoes,
      status: veiculo.status
    });
  }

  /**
   * Delete vehicle
   */
  async deleteVeiculo(veiculo: Veiculo) {
    if (!this.isAdmin()) {
      await this.showErrorToast('Apenas administradores podem deletar veículos');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Deseja realmente excluir o veículo ${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.performDelete(veiculo);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Perform vehicle deletion
   */
  private async performDelete(veiculo: Veiculo) {
    const loading = await this.loadingController.create({
      message: 'Excluindo veículo...'
    });
    await loading.present();

    try {
      const token = localStorage.getItem('sgos_token');
      const options: any = {};
      
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }
      
      const response: any = await this.http.delete(
        `${environment.apiUrl}${environment.endpoints.veiculos}/${veiculo.id}`,
        options
      ).toPromise();
      
      console.log('Delete Response:', response);
      
      if (response && (response.status === 'success' || response.success)) {
        await this.showSuccessToast('Veículo excluído com sucesso');
        await this.loadVeiculos();
      } else {
        throw new Error(response?.message || 'Erro ao excluir veículo');
      }
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      await this.showErrorToast('Erro ao excluir veículo: ' + (error.message || 'Erro desconhecido'));
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Save new vehicle
   */
  async saveVeiculo() {
    if (this.veiculoForm.invalid) {
      await this.showErrorToast('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Salvando veículo...'
    });
    await loading.present();

    let formData: any;
    try {
      const token = localStorage.getItem(environment.storage.token);
      const options: any = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
      
      formData = this.veiculoForm.value;
      
      // Garantir que ano_fabricacao seja string
      if (formData.ano_fabricacao) {
        formData.ano_fabricacao = formData.ano_fabricacao.toString();
      }
      
      // Remover campos vazios para evitar problemas de validação
      Object.keys(formData).forEach(key => {
        if (formData[key] === '' || formData[key] === null || formData[key] === undefined) {
          delete formData[key];
        }
      });
      
      const response: any = await this.http.post(
        `${environment.apiUrl}${environment.endpoints.veiculos}/`,
        formData,
        options
      ).toPromise();
      
      console.log('Create Vehicle Response:', response);
      
      if (response && (response.status === 'success' || response.success)) {
        await this.showSuccessToast(response.message || 'Veículo cadastrado com sucesso!');
        this.hideForms();
        await this.loadVeiculos();
      } else {
        throw new Error(response?.message || 'Erro ao cadastrar veículo');
      }
    } catch (error: any) {
      console.error('Error creating vehicle:', error);
      console.error('Error response:', error.error);
      console.error('Form data sent:', formData || 'Not available');
      
      let errorMessage = 'Erro ao cadastrar veículo';
      
      if (error.error && error.error.detail) {
        if (Array.isArray(error.error.detail)) {
          errorMessage = error.error.detail.map((d: any) => d.msg || d.message || d).join(', ');
        } else {
          errorMessage = error.error.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      await this.showErrorToast(errorMessage);
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Update existing vehicle
   */
  async updateVeiculo() {
    if (this.veiculoForm.invalid || !this.editingVeiculo) {
      await this.showErrorToast('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Atualizando veículo...'
    });
    await loading.present();

    let formData: any;
    try {
      const token = localStorage.getItem(environment.storage.token);
      const options: any = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
      
      formData = this.veiculoForm.value;
      
      // Garantir que ano_fabricacao seja string
      if (formData.ano_fabricacao) {
        formData.ano_fabricacao = formData.ano_fabricacao.toString();
      }
      
      // Remover campos vazios para evitar problemas de validação
      Object.keys(formData).forEach(key => {
        if (formData[key] === '' || formData[key] === null || formData[key] === undefined) {
          delete formData[key];
        }
      });
      
      const response: any = await this.http.put(
        `${environment.apiUrl}${environment.endpoints.veiculos}/${this.editingVeiculo.id}`,
        formData,
        options
      ).toPromise();
      
      console.log('Update Vehicle Response:', response);
      
      if (response && (response.status === 'success' || response.success)) {
        await this.showSuccessToast(response.message || 'Veículo atualizado com sucesso!');
        this.hideForms();
        await this.loadVeiculos();
      } else {
        throw new Error(response?.message || 'Erro ao atualizar veículo');
      }
    } catch (error: any) {
      console.error('Error updating vehicle:', error);
      console.error('Error response:', error.error);
      console.error('Form data sent:', formData || 'Not available');
      
      let errorMessage = 'Erro ao atualizar veículo';
      
      if (error.error && error.error.detail) {
        if (Array.isArray(error.error.detail)) {
          errorMessage = error.error.detail.map((d: any) => d.msg || d.message || d).join(', ');
        } else {
          errorMessage = error.error.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      await this.showErrorToast(errorMessage);
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'ATIVO':
        return 'success';
      case 'MANUTENCAO':
        return 'warning';
      case 'INATIVO':
        return 'danger';
      default:
        return 'medium';
    }
  }

  /**
   * Get status display name
   */
  getStatusDisplayName(status: string): string {
    switch (status) {
      case 'ATIVO':
        return 'Ativo';
      case 'MANUTENCAO':
        return 'Manutenção';
      case 'INATIVO':
        return 'Inativo';
      default:
        return status;
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByVeiculoId(index: number, veiculo: Veiculo): number {
    return veiculo.id;
  }

  /**
   * Open menu
   */
  async openMenu() {
    await this.menuController.open();
  }

  /**
   * Show success toast
   */
  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'success'
    });
    await toast.present();
  }

  /**
   * Show error toast
   */
  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }

  /**
   * Get vehicles by status for stats
   */
  getVeiculosByStatus(status: string): Veiculo[] {
    return this.veiculos.filter(v => v.status === status);
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }
}