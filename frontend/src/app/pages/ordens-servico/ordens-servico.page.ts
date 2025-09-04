import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, LoadingController, ToastController, AlertController, ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OSDetailsModalComponent } from './os-details-modal.component';

interface OrdemServico {
  id: number;
  data: string;
  veiculo_id: number;
  hodometro: string;
  problema_apresentado: string;
  sistema_afetado: string;
  causa_da_avaria: string;
  manutencao: 'PREVENTIVA' | 'CORRETIVA';
  situacao_os: 'ABERTA' | 'FECHADA' | 'RETIRADA';
  usuario_id: number;
  perfil: string;
  created_at: string;
  veiculo?: {
    id: number;
    marca: string;
    modelo: string;
    placa: string;
    patrimonio: string;
  };
  usuario?: {
    id: number;
    nome: string;
    username: string;
    perfil: string;
  };
  encerrar_os?: {
    id: number;
    nome_mecanico: string;
    data_da_manutencao: string;
    situacao: string;
    tempo_total: string;
    usuario_id: number;
    abrir_os_id: number;
    modelo_veiculo: string;
    created_at: string;
  };
  encerramentos?: {
    id: number;
    nome_mecanico: string;
    data_da_manutencao: string;
    situacao: string;
    tempo_total: string;
    usuario_id: number;
    abrir_os_id: number;
    modelo_veiculo: string;
    created_at: string;
  }[];
}

interface Veiculo {
  id: number;
  marca: string;
  modelo: string;
  placa: string;
  patrimonio: string;
  status: string;
}

interface PecaUtilizada {
  id: number;
  peca_utilizada: string;
  num_ficha: string;
  qtd: string;
  abrir_os_id: number;
  usuario_id: number;
  created_at: string;
  usuario?: {
    id: number;
    username: string;
    nome_completo: string;
  };
}

interface ServicoRealizado {
  id: number;
  servico_realizado: string;
  tempo_de_servico_realizado: string;
  abrir_os_id: number;
  usuario_id: number;
  created_at: string;
  usuario?: {
    id: number;
    username: string;
    nome_completo: string;
  };
}

@Component({
  selector: 'app-ordens-servico',
  templateUrl: './ordens-servico-simple.page.html',
  styleUrls: ['./ordens-servico.page.scss'],
})
export class OrdensServicoPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Configurações do environment
  environment = environment;
  
  ordensServico: OrdemServico[] = [];
  filteredOrdens: OrdemServico[] = [];
  veiculos: Veiculo[] = [];
  currentUser: any = null;
  loading = false;
  searchTerm = '';
  selectedStatus = '';
  
  // Modal properties
  selectedOS: OrdemServico | null = null;
  pecasUtilizadas: PecaUtilizada[] = [];
  servicosRealizados: ServicoRealizado[] = [];
  loadingModal = false;
  
  // Create OS form data
  showCreateForm = false;
  createFormData = {
    data: this.getCurrentDate(),
    veiculo_id: '',
    hodometro: '',
    problema_apresentado: '',
    sistema_afetado: '',
    causa_da_avaria: '',
    manutencao: 'PREVENTIVA' as 'PREVENTIVA' | 'CORRETIVA'
  };
  
  statusOptions = [
    { value: '', label: 'Todas' },
    { value: 'ABERTA', label: 'Abertas' },
    { value: 'FECHADA', label: 'Fechadas' },
    { value: 'RETIRADA', label: 'Retiradas' }
  ];

  sistemaOptions = [
    'Motor',
    'Transmissão',
    'Freios',
    'Suspensão',
    'Elétrico',
    'Ar Condicionado',
    'Carroceria',
    'Pneus',
    'Combustível',
    'Outros'
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
    
    this.loadOrdensServico();
    this.loadVeiculos();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load service orders from API
   */
  async loadOrdensServico() {
    this.loading = true;
    
    try {
      const token = localStorage.getItem('sgos_token');
      const options: any = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response: any = await this.http.get(
        'http://localhost:8000/api/v1/ordens-servico/',
        options
      ).toPromise();
      
      console.log('OS Response:', response);
      
      if (response && (response.status === 'success' || response.success) && response.data) {
        this.ordensServico = response.data.items || [];
        console.log('Loaded OS:', this.ordensServico.length);
        
        // Carregar informações do mecânico para OS fechadas
        await this.loadMechanicInfoForClosedOS();
        
        this.applyFilters();
      } else {
        console.log('No data in response:', response);
        this.ordensServico = [];
        this.applyFilters();
      }
    } catch (error: any) {
      console.error('Error loading service orders:', error);
      await this.showErrorToast('Erro ao carregar ordens de serviço: ' + (error.message || 'Erro desconhecido'));
    } finally {
      this.loading = false;
    }
  }

  /**
   * Load vehicles for selection
   */
  async loadVeiculos() {
    try {
      const token = localStorage.getItem('sgos_token');
      const options: any = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response: any = await this.http.get(
        'http://localhost:8000/api/v1/veiculos/',
        options
      ).toPromise();
      
      console.log('Vehicles Response:', response);
      
      if (response && (response.status === 'success' || response.success) && response.data) {
        this.veiculos = response.data.items || [];
        console.log('Loaded vehicles:', this.veiculos.length);
      } else {
        console.log('No vehicles data:', response);
        this.veiculos = [];
      }
    } catch (error: any) {
      console.error('Error loading vehicles:', error);
    }
  }

  /**
   * Apply search and status filters
   */
  applyFilters() {
    this.filteredOrdens = this.ordensServico.filter(ordem => {
      const matchesSearch = !this.searchTerm || 
        ordem.problema_apresentado.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ordem.sistema_afetado.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ordem.veiculo?.marca.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ordem.veiculo?.modelo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ordem.veiculo?.placa.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || ordem.situacao_os === this.selectedStatus;
      
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
    await this.loadOrdensServico();
    event.target.complete();
  }

  /**
   * Show create OS form
   */
  showCreateOS() {
    if (this.veiculos.length === 0) {
      this.showErrorToast('Nenhum veículo disponível. Cadastre veículos primeiro.');
      return;
    }
    
    this.showCreateForm = true;
    this.resetCreateForm();
  }

  /**
   * Hide create OS form
   */
  hideCreateOS() {
    this.showCreateForm = false;
    this.resetCreateForm();
  }

  /**
   * Reset create form
   */
  resetCreateForm() {
    this.createFormData = {
      data: this.getCurrentDate(),
      veiculo_id: '',
      hodometro: '',
      problema_apresentado: '',
      sistema_afetado: '',
      causa_da_avaria: '',
      manutencao: 'PREVENTIVA'
    };
  }

  /**
   * Create new service order
   */
  async createOrdemServico() {
    // Validate form
    if (!this.isCreateFormValid()) {
      await this.showErrorToast('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Validate hodometro
    const hodometroNum = parseInt(this.createFormData.hodometro);
    if (isNaN(hodometroNum) || hodometroNum <= 0) {
      await this.showErrorToast('Hodômetro deve ser um número válido maior que zero');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Criando ordem de serviço...'
    });
    await loading.present();

    try {
      const token = localStorage.getItem('sgos_token');
      const options: any = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
      
      const formData = {
        ...this.createFormData,
        veiculo_id: parseInt(this.createFormData.veiculo_id),
        hodometro: this.createFormData.hodometro,
        perfil: this.currentUser?.perfil || 'MECANICO',
        situacao_os: 'ABERTA'
      };
      
      const response: any = await this.http.post(
        'http://localhost:8000/api/v1/ordens-servico/',
        formData,
        options
      ).toPromise();
      
      console.log('Create OS Response:', response);
      
      if (response && (response.status === 'success' || response.success)) {
        await this.showSuccessToast('Ordem de serviço criada com sucesso!');
        this.hideCreateOS();
        await this.loadOrdensServico();
      } else {
        throw new Error(response?.message || 'Erro ao criar OS');
      }
    } catch (error: any) {
      console.error('Error creating service order:', error);
      await this.showErrorToast('Erro ao criar ordem de serviço: ' + (error.message || 'Erro desconhecido'));
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Validate create form
   */
  isCreateFormValid(): boolean {
    const hodometroNum = parseInt(this.createFormData.hodometro);
    return !!(
      this.createFormData.data &&
      this.createFormData.veiculo_id &&
      this.createFormData.hodometro &&
      !isNaN(hodometroNum) &&
      hodometroNum > 0 &&
      this.createFormData.problema_apresentado &&
      this.createFormData.sistema_afetado &&
      this.createFormData.causa_da_avaria
    );
  }

  /**
   * Get current date in YYYY-MM-DD format
   */
  getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'ABERTA':
        return 'warning';
      case 'FECHADA':
        return 'success';
      case 'RETIRADA':
        return 'primary';
      default:
        return 'medium';
    }
  }

  /**
   * Get status display name
   */
  getStatusDisplayName(status: string): string {
    switch (status) {
      case 'ABERTA':
        return 'Aberta';
      case 'FECHADA':
        return 'Fechada';
      case 'RETIRADA':
        return 'Retirada';
      default:
        return status;
    }
  }

  /**
   * Get maintenance type display name
   */
  getMaintenanceDisplayName(type: string): string {
    switch (type) {
      case 'PREVENTIVA':
        return 'Preventiva';
      case 'CORRETIVA':
        return 'Corretiva';
      default:
        return type;
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
   * Get vehicle display name
   */
  getVeiculoDisplayName(veiculo: any): string {
    if (!veiculo) return 'Veículo não encontrado';
    return `${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})`;
  }

  /**
   * Get mechanics display names
   */
  getMechanicsDisplayNames(os: OrdemServico): string {
    if (os.encerramentos && os.encerramentos.length > 0) {
      const mecanicos = os.encerramentos.map(e => e.nome_mecanico || 'Não informado');
      return mecanicos.join(', ');
    } else if (os.encerrar_os?.nome_mecanico) {
      return os.encerrar_os.nome_mecanico;
    }
    return 'Não informado';
  }

  /**
   * View OS details
   */
  async viewOSDetails(os: OrdemServico) {
    this.selectedOS = os;
    await this.loadPecasEServicos(os.id);
    this.showOSDetailsModal(os);
  }


  /**
   * Load parts and services for OS
   */
  async loadPecasEServicos(osId: number) {
    this.loadingModal = true;
    
    try {
      // Carregar peças utilizadas
      await this.loadPecasUtilizadas(osId);
      
      // Carregar serviços realizados
      await this.loadServicosRealizados(osId);
    } catch (error) {
      console.error('Erro ao carregar peças e serviços:', error);
    } finally {
      this.loadingModal = false;
    }
  }

  /**
   * Load used parts for OS
   */
  async loadPecasUtilizadas(osId: number) {
    try {
      const token = localStorage.getItem(environment.storage.token);
      const options: any = {};
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }

      const response: any = await this.http.get(
        `${environment.apiUrl}${environment.endpoints.pecasUtilizadas}/os/${osId}/pecas`,
        options
      ).toPromise();

      if (response.status === 'success' || response.success) {
        this.pecasUtilizadas = response.data?.items || response.data || [];
      } else {
        this.pecasUtilizadas = [];
      }
    } catch (error) {
      console.error('Erro ao carregar peças utilizadas:', error);
      this.pecasUtilizadas = [];
    }
  }

  /**
   * Load performed services for OS
   */
  async loadServicosRealizados(osId: number) {
    try {
      const token = localStorage.getItem(environment.storage.token);
      const options: any = {};
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }

      const response: any = await this.http.get(
        `${environment.apiUrl}${environment.endpoints.servicosRealizados}/os/${osId}/servicos`,
        options
      ).toPromise();

      if (response.status === 'success' || response.success) {
        this.servicosRealizados = response.data?.items || response.data || [];
      } else {
        this.servicosRealizados = [];
      }
    } catch (error) {
      console.error('Erro ao carregar serviços realizados:', error);
      this.servicosRealizados = [];
    }
  }

  /**
   * Show OS details modal
   */
  async showOSDetailsModal(os: OrdemServico) {
    const modal = await this.modalController.create({
      component: OSDetailsModalComponent,
      componentProps: {
        ordemServico: os,
        pecasUtilizadas: this.pecasUtilizadas,
        servicosRealizados: this.servicosRealizados,
        loading: this.loadingModal
      },
      cssClass: 'os-details-modal'
    });
    
    await modal.present();
    
    // Listen for modal dismissal to refresh the list if OS was closed or vehicle withdrawn
    const { data } = await modal.onDidDismiss();
    if (data && (data.osClosed || data.vehicleWithdrawn)) {
      await this.loadOrdensServico();
    }
  }



  /**
   * Get encerramento info for OS
   */
  async getEncerramentoInfo(osId: number): Promise<any[]> {
    try {
      const token = localStorage.getItem('sgos_token');
      const options: any = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response: any = await this.http.get(
        `http://localhost:8000/api/v1/encerrar-os/?abrir_os_id=${osId}`,
        options
      ).toPromise();
      
      if (response && (response.status === 'success' || response.success) && response.data) {
        const encerramentos = response.data.items || [];
        console.log(`API Response para OS #${osId}:`, encerramentos);
        
        // Filtra apenas os encerramentos que pertencem a esta OS específica
        const encerramentosDaOS = encerramentos.filter((encerramento: any) => 
          encerramento.abrir_os_id === osId
        );
        console.log(`Encerramentos filtrados para OS #${osId}:`, encerramentosDaOS);
        return encerramentosDaOS;
      }
      
      return [];
    } catch (error: any) {
      console.error('Error loading encerramento info:', error);
      return [];
    }
  }

  /**
   * Load mechanic info for closed OS
   */
  async loadMechanicInfo(os: OrdemServico) {
    if (os.situacao_os === 'FECHADA' && !os.encerrar_os) {
      try {
        const encerramentos = await this.getEncerramentoInfo(os.id);
        console.log(`OS #${os.id} - Encerramentos encontrados:`, encerramentos);
        
        if (encerramentos && encerramentos.length > 0) {
          // Armazena o primeiro encerramento para compatibilidade com o template
          os.encerrar_os = encerramentos[0];
          // Armazena todos os encerramentos para uso futuro
          os.encerramentos = encerramentos;
          console.log(`OS #${os.id} - Mecânicos carregados:`, encerramentos.map(e => e.nome_mecanico));
        }
      } catch (error) {
        console.error('Error loading mechanic info:', error);
      }
    }
  }

  /**
   * Load mechanic info for all closed OS
   */
  async loadMechanicInfoForClosedOS() {
    const closedOS = this.ordensServico.filter(os => os.situacao_os === 'FECHADA');
    
    // Carrega as informações de mecânico para cada OS fechada individualmente
    for (const os of closedOS) {
      await this.loadMechanicInfo(os);
    }
  }

  /**
   * Get OS statistics
   */
  getOSByStatus(status: string): OrdemServico[] {
    return this.ordensServico.filter(os => os.situacao_os === status);
  }

  /**
   * Clear filters
   */
  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByOSId(index: number, os: OrdemServico): number {
    return os.id;
  }

  /**
   * Track by function for ngFor optimization (vehicles)
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
}
