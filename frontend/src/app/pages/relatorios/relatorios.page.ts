import { Component, OnInit } from '@angular/core';
import { MenuController, ToastController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import jsPDF from 'jspdf';
import { Veiculo } from '../../models/veiculo.model';

interface Usuario {
  id: number;
  username: string;
  nome_completo: string;
  nome?: string; // Campo retornado pelo backend
}

interface EncerrarOS {
  id: number;
  nome_mecanico: string;
  data_da_manutencao: string;
  situacao: string;
  tempo_total: string;
  usuario_id: number;
  abrir_os_id: number;
  modelo_veiculo: string;
  created_at: string;
}

interface RetiradaViatura {
  id: number;
  nome: string;
  data: string;
  encerrar_os_id: number;
  usuario_id: number;
  usuario?: Usuario;
  created_at: string;
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
  usuario?: Usuario;
  created_at: string;
  updated_at: string;
  pecas?: PecaUtilizada[];
  servicos?: ServicoRealizado[];
  encerrar_os?: EncerrarOS;
  retirada_viatura?: RetiradaViatura;
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

      // Buscar todas as ordens de serviço do veículo com informações do usuário
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

          // Buscar dados completos da ordem de serviço (incluindo retirada se existir)
          let ordemCompleta = ordem;
          try {
            const ordemCompletaResponse: any = await this.http.get(
              `${environment.apiUrl}${environment.endpoints.ordensServico}/${ordem.id}`,
              options
            ).toPromise();

            if (ordemCompletaResponse && (ordemCompletaResponse.status === 'success' || ordemCompletaResponse.success) && ordemCompletaResponse.data) {
              ordemCompleta = ordemCompletaResponse.data;
            }
          } catch (error) {
            console.error('Erro ao buscar dados completos da ordem:', error);
          }

          ordensCompletas.push({
            ...ordemCompleta,
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
      await this.gerarPDF();
      await this.showSuccessToast('Relatório PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      await this.showErrorToast('Erro ao exportar relatório');
    }
  }

  async exportarRelatorioTXT() {
    if (!this.relatorio) {
      await this.showErrorToast('Nenhum relatório para exportar');
      return;
    }

    try {
      const conteudo = this.gerarConteudoRelatorio();
      this.downloadRelatorio(conteudo);
      await this.showSuccessToast('Relatório TXT exportado com sucesso!');
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
Ano: ${this.relatorio!.veiculo.ano_fabricacao}
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

  private async gerarPDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Cores
    const primaryColor = [0, 123, 255]; // Azul
    const secondaryColor = [108, 117, 125]; // Cinza
    const successColor = [40, 167, 69]; // Verde
    const warningColor = [255, 193, 7]; // Amarelo

    // Cabeçalho
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const titleText = 'SGOS - Sistema de Gerenciamento de Ordem de Serviço';
    const titleWidth = doc.getTextWidth(titleText);
    doc.text(titleText, (pageWidth - titleWidth) / 2, 20);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    const subtitleText = 'Relatório Completo de Veículo';
    const subtitleWidth = doc.getTextWidth(subtitleText);
    doc.text(subtitleText, (pageWidth - subtitleWidth) / 2, 28);

    yPosition = 45;

    // Informações do Veículo - Layout Simples
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const infoTitle = 'INFORMAÇÕES DO VEÍCULO';
    const infoTitleWidth = doc.getTextWidth(infoTitle);
    doc.text(infoTitle, (pageWidth - infoTitleWidth) / 2, yPosition);
    yPosition += 15;

    // Informações do veículo em formato simples
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const veiculoInfo = [
      `Placa: ${this.relatorio!.veiculo.placa}`,
      `Marca: ${this.relatorio!.veiculo.marca}`,
      `Modelo: ${this.relatorio!.veiculo.modelo}`,
      `Ano: ${this.relatorio!.veiculo.ano_fabricacao || 'N/A'}`,
      `Status: ${this.relatorio!.veiculo.status}`,
      `Período: ${this.relatorio!.periodo}`
    ];

    veiculoInfo.forEach(info => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(info, margin, yPosition);
      yPosition += 8;
    });
    
    yPosition += 15;

    // Resumo Estatístico - Layout Simples
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const statsTitle = 'RESUMO ESTATÍSTICO';
    const statsTitleWidth = doc.getTextWidth(statsTitle);
    doc.text(statsTitle, (pageWidth - statsTitleWidth) / 2, yPosition);
    yPosition += 15;

    // Estatísticas em formato simples
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const statsInfo = [
      `Total de Ordens de Serviço: ${this.relatorio!.totalOrdens}`,
      `Total de Peças Utilizadas: ${this.relatorio!.totalPecas}`,
      `Total de Serviços Realizados: ${this.relatorio!.totalServicos}`
    ];

    statsInfo.forEach(stat => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(stat, margin, yPosition);
      yPosition += 8;
    });
    
    yPosition += 15;

    // Detalhamento das Ordens
    if (this.relatorio!.ordensServico.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const ordensTitle = 'DETALHAMENTO DAS ORDENS DE SERVIÇO';
      const ordensTitleWidth = doc.getTextWidth(ordensTitle);
      doc.text(ordensTitle, (pageWidth - ordensTitleWidth) / 2, yPosition);
      yPosition += 15;

      this.relatorio!.ordensServico.forEach((ordem, index) => {
        // Verificar se precisa de nova página
        if (yPosition > pageHeight - 150) {
          doc.addPage();
          yPosition = 20;
        }

        // Cabeçalho da ordem
        doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.rect(margin, yPosition - 5, contentWidth, 15, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`OS #${ordem.id} - ${ordem.data}`, margin + 5, yPosition + 5);
        yPosition += 20;

        // Informações da ordem em formato simples
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        const ordemInfo = [
          `Situação: ${ordem.situacao_os}`,
          `Problema: ${ordem.problema_apresentado}`,
          `Sistema Afetado: ${ordem.sistema_afetado}`,
          `Causa da Avaria: ${ordem.causa_da_avaria}`,
          `Manutenção: ${ordem.manutencao}`,
          `Hodômetro: ${ordem.hodometro}`,
          `Criada em: ${new Date(ordem.created_at).toLocaleString('pt-BR')}`,
          `Responsável: ${ordem.usuario?.nome || 'N/A'}`
        ];

        // Adicionar informação do mecânico se existir encerramento
        if (ordem.encerrar_os) {
          ordemInfo.push(`Mecânico: ${ordem.encerrar_os.nome_mecanico}`);
          ordemInfo.push(`Data da Manutenção: ${ordem.encerrar_os.data_da_manutencao}`);
          ordemInfo.push(`Tempo Total: ${ordem.encerrar_os.tempo_total}`);
        }

        // Adicionar informação de retirada se a situação for RETIRADA
        if (ordem.situacao_os === 'RETIRADA' && ordem.retirada_viatura) {
          ordemInfo.push(`Retirado por: ${ordem.retirada_viatura.nome}`);
          ordemInfo.push(`Data da Retirada: ${ordem.retirada_viatura.data}`);
        }

        ordemInfo.forEach(info => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          // Usar quebra de linha mais agressiva para textos longos
          yPosition = this.addTextWithWrap(doc, info, margin, yPosition, contentWidth - 10, 6);
        });
        
        yPosition += 10;

        // Peças Utilizadas
        if (ordem.pecas && ordem.pecas.length > 0) {
          if (yPosition > pageHeight - 50) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Peças Utilizadas (${ordem.pecas.length}):`, margin, yPosition);
          yPosition += 8;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          ordem.pecas.forEach((peca: PecaUtilizada, index: number) => {
            if (yPosition > pageHeight - 30) {
              doc.addPage();
              yPosition = 20;
            }
            const pecaText = `${index + 1}. ${peca.peca_utilizada}`;
            yPosition = this.addTextWithWrapSimple(doc, pecaText, margin + 10, yPosition, contentWidth - 20, 5);
            const fichaText = `   Ficha: ${peca.num_ficha} | Qtd: ${peca.qtd}`;
            yPosition = this.addTextWithWrapSimple(doc, fichaText, margin + 10, yPosition, contentWidth - 20, 5);
          });
          yPosition += 10;
        }

        // Serviços Realizados
        if (ordem.servicos && ordem.servicos.length > 0) {
          if (yPosition > pageHeight - 50) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Serviços Realizados (${ordem.servicos.length}):`, margin, yPosition);
          yPosition += 8;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          ordem.servicos.forEach((servico: ServicoRealizado, index: number) => {
            if (yPosition > pageHeight - 30) {
              doc.addPage();
              yPosition = 20;
            }
            const servicoText = `${index + 1}. ${servico.servico_realizado}`;
            yPosition = this.addTextWithWrapSimple(doc, servicoText, margin + 10, yPosition, contentWidth - 20, 5);
            const tempoText = `   Tempo: ${servico.tempo_de_servico_realizado}`;
            yPosition = this.addTextWithWrapSimple(doc, tempoText, margin + 10, yPosition, contentWidth - 20, 5);
          });
          yPosition += 10;
        }

        yPosition += 10;
      });
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Nenhuma ordem de serviço encontrada para este veículo.', margin, yPosition);
      yPosition += 10;
    }

    // Rodapé
    const dataAtual = new Date().toLocaleString('pt-BR');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text(`Relatório gerado em: ${dataAtual}`, margin, pageHeight - 20);
    doc.text('Sistema SGOS - Gerenciamento de Ordens de Serviço', pageWidth - margin - 100, pageHeight - 20);

    // Salvar o PDF
    const fileName = `relatorio_veiculo_${this.relatorio!.veiculo.placa}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  private addTextWithWrap(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6): number {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    // Usar a largura real do texto para calcular quebra
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const testWidth = doc.getTextWidth(testLine);
      
      if (testWidth > maxWidth && line.length > 0) {
        doc.text(line, x, currentY);
        line = words[i] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    
    if (line.length > 0) {
      // Verificar se a última linha também precisa ser quebrada
      const finalWidth = doc.getTextWidth(line);
      if (finalWidth > maxWidth) {
        // Quebrar a última linha se necessário
        const lastWords = line.split(' ');
        let lastLine = '';
        for (const word of lastWords) {
          const testLine = lastLine + word + ' ';
          const testWidth = doc.getTextWidth(testLine);
          if (testWidth > maxWidth && lastLine.length > 0) {
            doc.text(lastLine, x, currentY);
            lastLine = word + ' ';
            currentY += lineHeight;
          } else {
            lastLine = testLine;
          }
        }
        if (lastLine.length > 0) {
          // Verificar se a última palavra individual é muito longa
          const lastWordWidth = doc.getTextWidth(lastLine);
          if (lastWordWidth > maxWidth) {
            // Quebrar palavra muito longa por caracteres
            currentY = this.breakLongWord(doc, lastLine, x, currentY, maxWidth, lineHeight);
          } else {
            doc.text(lastLine, x, currentY);
            currentY += lineHeight;
          }
        }
      } else {
        doc.text(line, x, currentY);
        currentY += lineHeight;
      }
    }
    
    return currentY;
  }

  private addTextWithWrapSimple(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6): number {
    // Versão mais simples e agressiva para quebra de linha
    const words = text.split(' ');
    let currentY = y;
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i] + ' ';
      const testWidth = doc.getTextWidth(testLine);
      
      if (testWidth > maxWidth && currentLine.length > 0) {
        // Quebrar linha atual
        doc.text(currentLine, x, currentY);
        currentY += lineHeight;
        currentLine = words[i] + ' ';
      } else {
        currentLine = testLine;
      }
    }
    
    // Adicionar última linha
    if (currentLine.length > 0) {
      doc.text(currentLine, x, currentY);
      currentY += lineHeight;
    }
    
    return currentY;
  }

  private breakLongWord(doc: jsPDF, word: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
    let currentY = y;
    let remainingWord = word.trim();
    
    while (remainingWord.length > 0) {
      let charCount = 0;
      let testWord = '';
      
      // Encontrar quantos caracteres cabem na linha
      while (charCount < remainingWord.length) {
        testWord = remainingWord.substring(0, charCount + 1);
        const testWidth = doc.getTextWidth(testWord);
        if (testWidth > maxWidth) {
          break;
        }
        charCount++;
      }
      
      // Se não cabe nem um caractere, quebrar forçadamente
      if (charCount === 0) {
        charCount = 1;
      }
      
      const wordPart = remainingWord.substring(0, charCount);
      doc.text(wordPart, x, currentY);
      currentY += lineHeight;
      remainingWord = remainingWord.substring(charCount).trim();
    }
    
    return currentY;
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
