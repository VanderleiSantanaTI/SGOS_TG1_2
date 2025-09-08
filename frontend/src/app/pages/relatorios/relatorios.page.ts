import { Component, OnInit } from '@angular/core';
import { MenuController, ToastController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface Veiculo {
  id: number;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  status: string;
}

interface OrdemServico {
  id: number;
  data: string;
  veiculo: Veiculo;
  situacao_os: string;
  problema_apresentado: string;
  sistema_afetado: string;
  causa_da_avaria: string;
  manutencao: string;
  hodometro: string;
  usuario_id: number;
  created_at: string;
  updated_at: string;
  pecas?: PecaUtilizada[];
  servicos?: ServicoRealizado[];
}

interface PecaUtilizada {
  id: number;
  peca_utilizada: string;
  num_ficha: string;
  qtd: string;
  abrir_os_id: number;
  usuario_id: number;
  created_at: string;
}

interface ServicoRealizado {
  id: number;
  servico_realizado: string;
  tempo_de_servico_realizado: string;
  abrir_os_id: number;
  usuario_id: number;
  created_at: string;
}

interface RelatorioVeiculo {
  veiculo: Veiculo;
  ordensServico: OrdemServico[];
  totalPecas: number;
  totalServicos: number;
  totalOrdens: number;
  periodo: string;
}

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.page.html',
  styleUrls: ['./relatorios.page.scss'],
})
export class RelatoriosPage implements OnInit {
  veiculos: Veiculo[] = [];
  veiculoSelecionado: Veiculo | null = null;
  relatorio: RelatorioVeiculo | null = null;
  loading = false;
  showRelatorio = false;
  currentUser: any = null;

  constructor(
    private menuController: MenuController,
    private http: HttpClient,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router
  ) { }

  ngOnInit() {
    this.checkAuth();
    this.loadVeiculos();
  }

  async openMenu() { 
    await this.menuController.open(); 
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

      if (response.status === 'success' || response.success) {
        this.veiculos = response.data?.items || response.data || [];
      }
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      await this.showErrorToast('Erro ao carregar veículos');
    } finally {
      this.loading = false;
    }
  }

  selecionarVeiculo(veiculo: Veiculo) {
    this.veiculoSelecionado = veiculo;
    this.showRelatorio = false;
    this.relatorio = null;
  }

  async gerarRelatorioVeiculo() {
    if (!this.veiculoSelecionado) {
      await this.showErrorToast('Selecione um veículo primeiro');
      return;
    }

    this.loading = true;
    try {
      const token = localStorage.getItem(environment.storage.token);
      const options: any = {};
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }

      // Buscar todas as ordens de serviço do veículo
      const ordensResponse: any = await this.http.get(
        `${environment.apiUrl}${environment.endpoints.ordensServico}/?veiculo_id=${this.veiculoSelecionado.id}`,
        options
      ).toPromise();

      if (ordensResponse.status === 'success' || ordensResponse.success) {
        const ordens = ordensResponse.data?.items || ordensResponse.data || [];
        
        // Buscar peças e serviços para cada ordem
        let totalPecas = 0;
        let totalServicos = 0;
        const ordensCompletas = [];

        for (const ordem of ordens) {
          // Buscar peças utilizadas
          const pecasResponse: any = await this.http.get(
            `${environment.apiUrl}${environment.endpoints.pecasUtilizadas}/os/${ordem.id}/pecas`,
            options
          ).toPromise();

          const pecas = pecasResponse.data?.items || pecasResponse.data || [];
          totalPecas += pecas.length;

          // Buscar serviços realizados
          const servicosResponse: any = await this.http.get(
            `${environment.apiUrl}${environment.endpoints.servicosRealizados}/os/${ordem.id}/servicos`,
            options
          ).toPromise();

          const servicos = servicosResponse.data?.items || servicosResponse.data || [];
          totalServicos += servicos.length;

          ordensCompletas.push({
            ...ordem,
            pecas: pecas,
            servicos: servicos
          });
        }

        this.relatorio = {
          veiculo: this.veiculoSelecionado,
          ordensServico: ordensCompletas,
          totalPecas: totalPecas,
          totalServicos: totalServicos,
          totalOrdens: ordens.length,
          periodo: this.calcularPeriodo(ordens)
        };

        this.showRelatorio = true;
        await this.showSuccessToast('Relatório gerado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      await this.showErrorToast('Erro ao gerar relatório');
    } finally {
      this.loading = false;
    }
  }

  calcularPeriodo(ordens: OrdemServico[]): string {
    if (ordens.length === 0) return 'Nenhuma ordem encontrada';
    
    const datas = ordens.map(o => new Date(o.data)).sort((a, b) => a.getTime() - b.getTime());
    const primeira = datas[0];
    const ultima = datas[datas.length - 1];
    
    return `${primeira.toLocaleDateString('pt-BR')} a ${ultima.toLocaleDateString('pt-BR')}`;
  }

  async exportarRelatorio() {
    if (!this.relatorio) {
      await this.showErrorToast('Nenhum relatório para exportar');
      return;
    }

    try {
      const conteudo = this.gerarConteudoRelatorio();
      this.downloadRelatorio(conteudo);
      await this.showSuccessToast('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      await this.showErrorToast('Erro ao exportar relatório');
    }
  }

  private gerarConteudoRelatorio(): string {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR');
    
    let relatorio = `
RELATÓRIO COMPLETO DE VEÍCULO - SGOS
=====================================

VEÍCULO: ${this.relatorio!.veiculo.placa}
Marca: ${this.relatorio!.veiculo.marca}
Modelo: ${this.relatorio!.veiculo.modelo}
Ano: ${this.relatorio!.veiculo.ano}
Status: ${this.relatorio!.veiculo.status}

PERÍODO: ${this.relatorio!.periodo}

Relatório gerado em: ${dataAtual} às ${horaAtual}

RESUMO GERAL:
=============
Total de Ordens de Serviço: ${this.relatorio!.totalOrdens}
Total de Peças Utilizadas: ${this.relatorio!.totalPecas}
Total de Serviços Realizados: ${this.relatorio!.totalServicos}

DETALHAMENTO POR ORDEM DE SERVIÇO:
==================================
`;

    if (this.relatorio!.ordensServico.length === 0) {
      relatorio += 'Nenhuma ordem de serviço encontrada para este veículo.\n\n';
    } else {
      this.relatorio!.ordensServico.forEach((ordem, index) => {
        relatorio += `
${index + 1}. ORDEM DE SERVIÇO #${ordem.id}
   Data: ${ordem.data}
   Situação: ${ordem.situacao_os}
   Problema: ${ordem.problema_apresentado}
   Sistema Afetado: ${ordem.sistema_afetado}
   Causa da Avaria: ${ordem.causa_da_avaria}
   Manutenção: ${ordem.manutencao}
   Hodômetro: ${ordem.hodometro}
   Criada em: ${new Date(ordem.created_at).toLocaleString('pt-BR')}

   PEÇAS UTILIZADAS (${ordem.pecas ? ordem.pecas.length : 0}):
   -----------------------------------------
`;

        if (ordem.pecas && ordem.pecas.length === 0) {
          relatorio += '   Nenhuma peça registrada.\n';
        } else if (ordem.pecas) {
          ordem.pecas.forEach((peca: PecaUtilizada, pecaIndex: number) => {
            relatorio += `   ${pecaIndex + 1}. ${peca.peca_utilizada}\n`;
            relatorio += `      Ficha: ${peca.num_ficha}\n`;
            relatorio += `      Quantidade: ${peca.qtd}\n`;
            relatorio += `      Adicionado em: ${new Date(peca.created_at).toLocaleString('pt-BR')}\n`;
          });
        }

        relatorio += `
   SERVIÇOS REALIZADOS (${ordem.servicos ? ordem.servicos.length : 0}):
   ----------------------------------------------
`;

        if (ordem.servicos && ordem.servicos.length === 0) {
          relatorio += '   Nenhum serviço registrado.\n';
        } else if (ordem.servicos) {
          ordem.servicos.forEach((servico: ServicoRealizado, servicoIndex: number) => {
            relatorio += `   ${servicoIndex + 1}. ${servico.servico_realizado}\n`;
            relatorio += `      Tempo: ${servico.tempo_de_servico_realizado}\n`;
            relatorio += `      Realizado em: ${new Date(servico.created_at).toLocaleString('pt-BR')}\n`;
          });
        }

        relatorio += '\n';
      });
    }

    relatorio += `
RESUMO FINAL:
=============
Veículo: ${this.relatorio!.veiculo.placa} - ${this.relatorio!.veiculo.marca} ${this.relatorio!.veiculo.modelo}
Período: ${this.relatorio!.periodo}
Total de Ordens: ${this.relatorio!.totalOrdens}
Total de Peças: ${this.relatorio!.totalPecas}
Total de Serviços: ${this.relatorio!.totalServicos}

---
Sistema SGOS - Gerenciamento de Ordens de Serviço
Relatório gerado automaticamente
`;

    return relatorio;
  }

  private downloadRelatorio(conteudo: string) {
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_veiculo_${this.relatorio!.veiculo.placa}_${new Date().toISOString().split('T')[0]}.txt`;
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
}
