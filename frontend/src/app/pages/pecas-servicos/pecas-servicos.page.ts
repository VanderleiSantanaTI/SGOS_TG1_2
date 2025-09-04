import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface OrdemServico {
  id: number;
  data: string;
  veiculo: {
    id: number;
    placa: string;
    modelo: string;
    marca: string;
  };
  situacao_os: string;
  problema_apresentado: string;
  sistema_afetado: string;
  causa_da_avaria: string;
  manutencao: string;
  hodometro: string;
  usuario_id: number;
  perfil: string;
  created_at: string;
  updated_at: string;
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
  // Configurações do environment
  environment = environment;
  
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
  
  // Variáveis para busca e filtros
  searchOrdens = '';
  searchPecas = '';
  searchServicos = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router
  ) {
    this.pecasForm = this.formBuilder.group({
      peca_utilizada: ['', Validators.required],
      num_ficha: ['', Validators.required],
      qtd: [1, [Validators.required, Validators.min(1)]]
    });

    this.servicosForm = this.formBuilder.group({
      servico_realizado: ['', Validators.required],
      tempo_de_servico_realizado: ['', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]]
    });
  }

  ngOnInit() {
    this.checkAuth();
    this.loadOrdensAbertas();
  }

  /**
   * Formatar tempo automaticamente (HH:MM)
   */
  formatarTempo(event: any) {
    let value = event.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    
    if (value.length >= 2) {
      value = value.substring(0, 2) + ':' + value.substring(2, 4);
    }
    
    // Limita a 4 dígitos (HH:MM)
    if (value.length > 5) {
      value = value.substring(0, 5);
    }
    
    this.servicosForm.patchValue({
      tempo_de_servico_realizado: value
    });
  }

  checkAuth() {
    const token = localStorage.getItem(environment.storage.token);
    const userStr = localStorage.getItem(environment.storage.user);
    
    if (token && userStr) {
      this.currentUser = JSON.parse(userStr);
    } else {
      this.router.navigate(['/login']);
    }
  }

  async loadOrdensAbertas() {
    this.loading = true;
    try {
      const token = localStorage.getItem(environment.storage.token);
      const options: any = {};
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }

      const response: any = await this.http.get(
        `${environment.apiUrl}${environment.endpoints.ordensServico}/`,
        options
      ).toPromise();

      if (response.status === 'success' || response.success) {
        // A API retorna response.data.items para listas paginadas
        const ordens = response.data?.items || response.data || [];
        this.ordensAbertas = ordens.filter((os: OrdemServico) => 
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
    console.log('Ordem selecionada:', ordem);
    this.loadPecasUtilizadas();
    this.loadServicosRealizados();
  }

  async loadPecasUtilizadas() {
    if (!this.ordemSelecionada) return;
    
    try {
      const token = localStorage.getItem(environment.storage.token);
      const options: any = {};
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }

      // Usar endpoint específico para buscar peças por OS
      const response: any = await this.http.get(
        `${environment.apiUrl}${environment.endpoints.pecasUtilizadas}/os/${this.ordemSelecionada.id}/pecas`,
        options
      ).toPromise();

      if (response.status === 'success' || response.success) {
        // O endpoint específico retorna response.data diretamente
        // O endpoint genérico retorna response.data.items
        this.pecasUtilizadas = response.data?.items || response.data || [];
        console.log('Peças carregadas:', this.pecasUtilizadas);
      } else {
        this.pecasUtilizadas = [];
        console.log('Erro na resposta da API de peças:', response);
      }
    } catch (error) {
      console.error('Erro ao carregar peças utilizadas:', error);
      this.pecasUtilizadas = [];
    }
  }

  async loadServicosRealizados() {
    if (!this.ordemSelecionada) return;
    
    try {
      const token = localStorage.getItem(environment.storage.token);
      const options: any = {};
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }

      // Usar endpoint específico para buscar serviços por OS
      const response: any = await this.http.get(
        `${environment.apiUrl}${environment.endpoints.servicosRealizados}/os/${this.ordemSelecionada.id}/servicos`,
        options
      ).toPromise();

      if (response.status === 'success' || response.success) {
        // O endpoint específico retorna response.data diretamente
        // O endpoint genérico retorna response.data.items
        this.servicosRealizados = response.data?.items || response.data || [];
        console.log('Serviços carregados:', this.servicosRealizados);
      } else {
        this.servicosRealizados = [];
        console.log('Erro na resposta da API de serviços:', response);
      }
    } catch (error) {
      console.error('Erro ao carregar serviços realizados:', error);
      this.servicosRealizados = [];
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
      const token = localStorage.getItem(environment.storage.token);
      const options: any = {};
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }

      const response: any = await this.http.post(
        `${environment.apiUrl}${environment.endpoints.pecasUtilizadas}/`,
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
      const token = localStorage.getItem(environment.storage.token);
      const options: any = {};
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }

      const response: any = await this.http.post(
        `${environment.apiUrl}${environment.endpoints.servicosRealizados}/`,
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
      const token = localStorage.getItem(environment.storage.token);
      const options: any = {};
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }

      const response: any = await this.http.delete(
        `${environment.apiUrl}${environment.endpoints.pecasUtilizadas}/${pecaId}`,
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
      const token = localStorage.getItem(environment.storage.token);
      const options: any = {};
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }

      const response: any = await this.http.delete(
        `${environment.apiUrl}${environment.endpoints.servicosRealizados}/${servicoId}`,
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

  // Métodos de filtro
  getFilteredPecas(): PecaUtilizada[] {
    if (!this.searchPecas.trim()) {
      return this.pecasUtilizadas;
    }
    
    const searchTerm = this.searchPecas.toLowerCase();
    return this.pecasUtilizadas.filter(peca => 
      peca.peca_utilizada.toLowerCase().includes(searchTerm) ||
      peca.num_ficha.toLowerCase().includes(searchTerm) ||
      peca.qtd.toLowerCase().includes(searchTerm)
    );
  }

  getFilteredServicos(): ServicoRealizado[] {
    if (!this.searchServicos.trim()) {
      return this.servicosRealizados;
    }
    
    const searchTerm = this.searchServicos.toLowerCase();
    return this.servicosRealizados.filter(servico => 
      servico.servico_realizado.toLowerCase().includes(searchTerm) ||
      servico.tempo_de_servico_realizado.toLowerCase().includes(searchTerm)
    );
  }

  getFilteredOrdens(): OrdemServico[] {
    if (!this.searchOrdens.trim()) {
      return this.ordensAbertas;
    }
    
    const searchTerm = this.searchOrdens.toLowerCase();
    return this.ordensAbertas.filter(ordem => 
      ordem.id.toString().includes(searchTerm) ||
      ordem.data.toLowerCase().includes(searchTerm) ||
      ordem.problema_apresentado?.toLowerCase().includes(searchTerm) ||
      ordem.sistema_afetado?.toLowerCase().includes(searchTerm) ||
      ordem.veiculo?.placa?.toLowerCase().includes(searchTerm) ||
      ordem.veiculo?.modelo?.toLowerCase().includes(searchTerm) ||
      ordem.veiculo?.marca?.toLowerCase().includes(searchTerm)
    );
  }

  // Métodos de confirmação de remoção
  async confirmarRemocaoPeca(peca: PecaUtilizada) {
    const alert = await this.alertController.create({
      header: 'Confirmar Remoção',
      message: `Deseja realmente remover a peça "${peca.peca_utilizada}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          role: 'destructive',
          handler: () => {
            this.removerPeca(peca.id!);
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmarRemocaoServico(servico: ServicoRealizado) {
    const alert = await this.alertController.create({
      header: 'Confirmar Remoção',
      message: `Deseja realmente remover o serviço "${servico.servico_realizado}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          role: 'destructive',
          handler: () => {
            this.removerServico(servico.id!);
          }
        }
      ]
    });

    await alert.present();
  }

  // Método de exportação
  async exportarRelatorio() {
    if (!this.ordemSelecionada) {
      await this.showErrorToast('Nenhuma ordem de serviço selecionada');
      return;
    }

    try {
      const relatorio = this.gerarRelatorio();
      this.downloadRelatorio(relatorio);
      await this.showSuccessToast('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      await this.showErrorToast('Erro ao exportar relatório');
    }
  }

  private gerarRelatorio(): string {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR');
    
    let relatorio = `
RELATÓRIO DE PEÇAS E SERVIÇOS - SGOS
=====================================

Ordem de Serviço: #${this.ordemSelecionada!.id}
Veículo: ${this.ordemSelecionada!.veiculo.placa} - ${this.ordemSelecionada!.veiculo.marca} ${this.ordemSelecionada!.veiculo.modelo}
Data: ${this.ordemSelecionada!.data}
Problema: ${this.ordemSelecionada!.problema_apresentado}
Sistema Afetado: ${this.ordemSelecionada!.sistema_afetado}
Causa da Avaria: ${this.ordemSelecionada!.causa_da_avaria}
Manutenção: ${this.ordemSelecionada!.manutencao}
Hodômetro: ${this.ordemSelecionada!.hodometro}

Relatório gerado em: ${dataAtual} às ${horaAtual}

PEÇAS UTILIZADAS:
================
`;

    if (this.pecasUtilizadas.length === 0) {
      relatorio += 'Nenhuma peça registrada.\n\n';
    } else {
      this.pecasUtilizadas.forEach((peca, index) => {
        relatorio += `${index + 1}. ${peca.peca_utilizada}\n`;
        relatorio += `   Ficha: ${peca.num_ficha}\n`;
        relatorio += `   Quantidade: ${peca.qtd}\n`;
        if (peca.created_at) {
          relatorio += `   Adicionado em: ${new Date(peca.created_at).toLocaleString('pt-BR')}\n`;
        }
        relatorio += '\n';
      });
    }

    relatorio += `
SERVIÇOS REALIZADOS:
===================
`;

    if (this.servicosRealizados.length === 0) {
      relatorio += 'Nenhum serviço registrado.\n\n';
    } else {
      this.servicosRealizados.forEach((servico, index) => {
        relatorio += `${index + 1}. ${servico.servico_realizado}\n`;
        relatorio += `   Tempo: ${servico.tempo_de_servico_realizado}\n`;
        if (servico.created_at) {
          relatorio += `   Realizado em: ${new Date(servico.created_at).toLocaleString('pt-BR')}\n`;
        }
        relatorio += '\n';
      });
    }

    relatorio += `
RESUMO:
=======
Total de Peças: ${this.calcularTotalPecas()}
Total de Serviços: ${this.calcularTotalServicos()}
Total Geral: ${this.calcularTotalGeral()}

---
Sistema SGOS - Gerenciamento de Ordens de Serviço
`;

    return relatorio;
  }

  private downloadRelatorio(conteudo: string) {
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_os_${this.ordemSelecionada!.id}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }



  async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: environment.toast.duration.success,
      color: 'success',
      position: environment.toast.position as any
    });
    await toast.present();
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: environment.toast.duration.error,
      color: 'danger',
      position: environment.toast.position as any
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
