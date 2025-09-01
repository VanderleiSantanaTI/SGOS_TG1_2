import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, LoadingController, ToastController, AlertController, ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Veiculo {
  id: number;
  marca: string;
  modelo: string;
  placa: string;
  su_cia_viatura: string;
  patrimonio: string;
  ano_fabricacao?: string;
  cor?: string;
  status: 'ATIVO' | 'MANUTENCAO' | 'INATIVO';
  created_at: string;
}

@Component({
  selector: 'app-veiculos',
  templateUrl: './veiculos.page.html',
  styleUrls: ['./veiculos.page.scss'],
})
export class VeiculosPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
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
  
  statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'ATIVO', label: 'Ativo' },
    { value: 'MANUTENCAO', label: 'Manutenção' },
    { value: 'INATIVO', label: 'Inativo' }
  ];

  constructor(
    private router: Router,
    private menuController: MenuController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController,
    private http: HttpClient
  ) {}

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
      const token = localStorage.getItem('sgos_token');
      const options: any = {};
      
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }
      
      const response: any = await this.http.get(
        'http://localhost:8000/api/v1/veiculos/', 
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
   * Navigate to create vehicle
   */
  createVeiculo() {
    if (!this.isAdmin()) {
      this.showErrorToast('Apenas administradores podem cadastrar veículos');
      return;
    }
    // For now, show alert - later implement modal/page
    this.showCreateVeiculoModal();
  }

  /**
   * Edit vehicle
   */
  editVeiculo(veiculo: Veiculo) {
    if (!this.canEdit()) {
      this.showErrorToast('Você não tem permissão para editar veículos');
      return;
    }
    // For now, show alert - later implement modal/page
    this.showEditVeiculoModal(veiculo);
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
        `http://localhost:8000/api/v1/veiculos/${veiculo.id}`,
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
   * Show create vehicle modal (simplified)
   */
  async showCreateVeiculoModal() {
    const alert = await this.alertController.create({
      header: 'Cadastrar Veículo',
      message: 'Funcionalidade será implementada em breve com formulário completo.',
      buttons: ['OK']
    });
    await alert.present();
  }

  /**
   * Show edit vehicle modal (simplified)
   */
  async showEditVeiculoModal(veiculo: Veiculo) {
    const alert = await this.alertController.create({
      header: 'Editar Veículo',
      message: `Funcionalidade de edição para ${veiculo.marca} ${veiculo.modelo} será implementada em breve.`,
      buttons: ['OK']
    });
    await alert.present();
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