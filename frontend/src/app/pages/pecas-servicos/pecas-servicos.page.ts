import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

interface OrdemServico {
  id: number;
  numero_os: string;
  veiculo: {
    id: number;
    placa: string;
    modelo: string;
    marca: string;
  };
  situacao_os: string;
  data_abertura: string;
  descricao_problema: string;
}

interface PecaUtilizada {
  id?: number;
  peca_utilizada: string;
  num_ficha: string;
  qtd: string;
  abrir_os_id: number;
  usuario_id?: number;
  created_at?: string;
}

interface ServicoRealizado {
  id?: number;
  servico_realizado: string;
  tempo_de_servico_realizado: string;
  abrir_os_id: number;
  usuario_id?: number;
  created_at?: string;
}

@Component({
  selector: 'app-pecas-servicos',
  templateUrl: './pecas-servicos.page.html',
  styleUrls: ['./pecas-servicos.page.scss'],
})
export class PecasServicosPage implements OnInit {
  ordensAbertas: OrdemServico[] = [];
  ordemSelecionada: OrdemServico | null = null;
  
  pecasForm: FormGroup;
  servicosForm: FormGroup;
  
  pecasUtilizadas: PecaUtilizada[] = [];
  servicosRealizados: ServicoRealizado[] = [];
  
  loading = false;
  showPecasForm = false;
  showServicosForm = false;
  
  currentUser: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router
  ) {
    this.pecasForm = this.formBuilder.group({
      peca_utilizada: ['', Validators.required],
      num_ficha: ['', Validators.required],
      qtd: ['1', Validators.required]
    });

    this.servicosForm = this.formBuilder.group({
      servico_realizado: ['', Validators.required],
      tempo_de_servico_realizado: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.checkAuth();
    this.loadOrdensAbertas();
  }

  checkAuth() {
    const token = localStorage.getItem('sgos_token');
    const userStr = localStorage.getItem('sgos_user');
    
    if (token && userStr) {
      this.currentUser = JSON.parse(userStr);
    } else {
      this.router.navigate(['/login']);
    }
  }

  async loadOrdensAbertas() {
    this.loading = true;
    try {
      const token = localStorage.getItem('sgos_token');
      const options: any = {};
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }

      const response: any = await this.http.get(
        'http://localhost:8000/api/v1/ordens-servico/',
        options
      ).toPromise();

      if (response.status === 'success' || response.success) {
        this.ordensAbertas = response.data.filter((os: OrdemServico) => 
          os.situacao_os === 'ABERTA'
        );
      }
    } catch (error) {
      console.error('Erro ao carregar ordens de serviço:', error);
      await this.showErrorToast('Erro ao carregar ordens de serviço');
    } finally {
      this.loading = false;
    }
  }

  selecionarOrdem(ordem: OrdemServico) {
    this.ordemSelecionada = ordem;
    this.loadPecasUtilizadas();
    this.loadServicosRealizados();
  }

  async loadPecasUtilizadas() {
    if (!this.ordemSelecionada) return;
    
    try {
      const token = localStorage.getItem('sgos_token');
      const options: any = {};
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }

      const response: any = await this.http.get(
        `http://localhost:8000/api/v1/pecas-utilizadas/`,
        options
      ).toPromise();

      if (response.status === 'success' || response.success) {
        this.pecasUtilizadas = (response.data || []).filter((peca: PecaUtilizada) => 
          peca.abrir_os_id === this.ordemSelecionada!.id
        );
      }
    } catch (error) {
      console.error('Erro ao carregar peças utilizadas:', error);
    }
  }

  async loadServicosRealizados() {
    if (!this.ordemSelecionada) return;
    
    try {
      const token = localStorage.getItem('sgos_token');
      const options: any = {};
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }

      const response: any = await this.http.get(
        `http://localhost:8000/api/v1/servicos-realizados/`,
        options
      ).toPromise();

      if (response.status === 'success' || response.success) {
        this.servicosRealizados = (response.data || []).filter((servico: ServicoRealizado) => 
          servico.abrir_os_id === this.ordemSelecionada!.id
        );
      }
    } catch (error) {
      console.error('Erro ao carregar serviços realizados:', error);
    }
  }

  togglePecasForm() {
    this.showPecasForm = !this.showPecasForm;
    this.showServicosForm = false;
  }

  toggleServicosForm() {
    this.showServicosForm = !this.showServicosForm;
    this.showPecasForm = false;
  }

  async adicionarPeca() {
    if (this.pecasForm.invalid || !this.ordemSelecionada) {
      await this.showErrorToast('Preencha todos os campos obrigatórios');
      return;
    }

    const peca: PecaUtilizada = {
      abrir_os_id: this.ordemSelecionada.id,
      peca_utilizada: this.pecasForm.get('peca_utilizada')?.value,
      num_ficha: this.pecasForm.get('num_ficha')?.value,
      qtd: this.pecasForm.get('qtd')?.value,
      usuario_id: this.currentUser?.id
    };

    try {
      const token = localStorage.getItem('sgos_token');
      const options: any = {};
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }

      const response: any = await this.http.post(
        'http://localhost:8000/api/v1/pecas-utilizadas/',
        peca,
        options
      ).toPromise();

      if (response.status === 'success' || response.success) {
        await this.showSuccessToast('Peça adicionada com sucesso!');
        this.pecasForm.reset();
        this.showPecasForm = false;
        await this.loadPecasUtilizadas();
      }
    } catch (error) {
      console.error('Erro ao adicionar peça:', error);
      await this.showErrorToast('Erro ao adicionar peça');
    }
  }

  async adicionarServico() {
    if (this.servicosForm.invalid || !this.ordemSelecionada) {
      await this.showErrorToast('Preencha todos os campos obrigatórios');
      return;
    }

    const servico: ServicoRealizado = {
      abrir_os_id: this.ordemSelecionada.id,
      servico_realizado: this.servicosForm.get('servico_realizado')?.value,
      tempo_de_servico_realizado: this.servicosForm.get('tempo_de_servico_realizado')?.value,
      usuario_id: this.currentUser?.id
    };

    try {
      const token = localStorage.getItem('sgos_token');
      const options: any = {};
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }

      const response: any = await this.http.post(
        'http://localhost:8000/api/v1/servicos-realizados/',
        servico,
        options
      ).toPromise();

      if (response.status === 'success' || response.success) {
        await this.showSuccessToast('Serviço adicionado com sucesso!');
        this.servicosForm.reset();
        this.showServicosForm = false;
        await this.loadServicosRealizados();
      }
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error);
      await this.showErrorToast('Erro ao adicionar serviço');
    }
  }

  async removerPeca(pecaId: number) {
    try {
      const token = localStorage.getItem('sgos_token');
      const options: any = {};
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }

      const response: any = await this.http.delete(
        `http://localhost:8000/api/v1/pecas-utilizadas/${pecaId}`,
        options
      ).toPromise();

      if (response.status === 'success' || response.success) {
        await this.showSuccessToast('Peça removida com sucesso!');
        await this.loadPecasUtilizadas();
      }
    } catch (error) {
      console.error('Erro ao remover peça:', error);
      await this.showErrorToast('Erro ao remover peça');
    }
  }

  async removerServico(servicoId: number) {
    try {
      const token = localStorage.getItem('sgos_token');
      const options: any = {};
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }

      const response: any = await this.http.delete(
        `http://localhost:8000/api/v1/servicos-realizados/${servicoId}`,
        options
      ).toPromise();

      if (response.status === 'success' || response.success) {
        await this.showSuccessToast('Serviço removido com sucesso!');
        await this.loadServicosRealizados();
      }
    } catch (error) {
      console.error('Erro ao remover serviço:', error);
      await this.showErrorToast('Erro ao remover serviço');
    }
  }

  calcularTotalPecas(): number {
    return this.pecasUtilizadas.length;
  }

  calcularTotalServicos(): number {
    return this.servicosRealizados.length;
  }

  calcularTotalGeral(): number {
    return this.calcularTotalPecas() + this.calcularTotalServicos();
  }



  async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }

  hasPermission(role: string): boolean {
    if (!this.currentUser) return false;
    
    const roles: { [key: string]: number } = { 'ADMIN': 4, 'SUPERVISOR': 3, 'MECANICO': 2, 'USUARIO': 1 };
    const userLevel = roles[this.currentUser.perfil as string] || 0;
    const requiredLevel = roles[role] || 0;
    
    return userLevel >= requiredLevel;
  }
}
