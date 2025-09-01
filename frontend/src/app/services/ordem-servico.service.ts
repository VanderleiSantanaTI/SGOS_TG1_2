import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService, QueryParams } from './api.service';
import { 
  OrdemServico, 
  OrdemServicoCreate, 
  OrdemServicoUpdate,
  OrdemServicoDetalhada,
  ServicoRealizado,
  ServicoRealizadoCreate,
  PecaUtilizada,
  PecaUtilizadaCreate,
  ApiResponse, 
  PaginatedResponse 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrdemServicoService {
  private readonly endpoint = '/ordens-servico';

  constructor(private apiService: ApiService) {}

  /**
   * Get all service orders with pagination
   */
  getOrdensServico(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    situacao_os?: string;
    veiculo_id?: number;
    usuario_id?: number;
    data_inicio?: string;
    data_fim?: string;
  }): Observable<PaginatedResponse<OrdemServico>> {
    const queryParams: QueryParams = {
      skip: params?.skip || 0,
      limit: params?.limit || 10,
      ...(params?.search && { search: params.search }),
      ...(params?.situacao_os && { situacao_os: params.situacao_os }),
      ...(params?.veiculo_id && { veiculo_id: params.veiculo_id }),
      ...(params?.usuario_id && { usuario_id: params.usuario_id }),
      ...(params?.data_inicio && { data_inicio: params.data_inicio }),
      ...(params?.data_fim && { data_fim: params.data_fim })
    };

    return this.apiService.getPaginated<OrdemServico>(this.endpoint, queryParams);
  }

  /**
   * Get service order by ID
   */
  getOrdemServico(id: number): Observable<OrdemServicoDetalhada> {
    return this.apiService.get<ApiResponse<OrdemServicoDetalhada>>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Ordem de serviço não encontrada');
        })
      );
  }

  /**
   * Create new service order
   */
  createOrdemServico(osData: OrdemServicoCreate): Observable<OrdemServico> {
    return this.apiService.post<ApiResponse<OrdemServico>>(this.endpoint, osData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao criar ordem de serviço');
        })
      );
  }

  /**
   * Update service order
   */
  updateOrdemServico(id: number, osData: OrdemServicoUpdate): Observable<OrdemServico> {
    return this.apiService.put<ApiResponse<OrdemServico>>(`${this.endpoint}/${id}`, osData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao atualizar ordem de serviço');
        })
      );
  }

  /**
   * Delete service order
   */
  deleteOrdemServico(id: number): Observable<boolean> {
    return this.apiService.delete<ApiResponse>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => {
          if (response.success) {
            return true;
          }
          throw new Error(response.message || 'Erro ao deletar ordem de serviço');
        })
      );
  }

  /**
   * Get service orders by status
   */
  getOrdensByStatus(status: 'ABERTA' | 'FECHADA' | 'RETIRADA'): Observable<OrdemServico[]> {
    return this.getOrdensServico({ situacao_os: status, limit: 1000 })
      .pipe(
        map(response => this.apiService.extractItems(response))
      );
  }

  /**
   * Get open service orders
   */
  getOrdensAbertas(): Observable<OrdemServico[]> {
    return this.getOrdensByStatus('ABERTA');
  }

  /**
   * Get closed service orders
   */
  getOrdensFechadas(): Observable<OrdemServico[]> {
    return this.getOrdensByStatus('FECHADA');
  }

  /**
   * Get service orders by vehicle
   */
  getOrdensByVeiculo(veiculoId: number): Observable<OrdemServico[]> {
    return this.getOrdensServico({ veiculo_id: veiculoId, limit: 1000 })
      .pipe(
        map(response => this.apiService.extractItems(response))
      );
  }

  /**
   * Get service orders by user
   */
  getOrdensByUsuario(usuarioId: number): Observable<OrdemServico[]> {
    return this.getOrdensServico({ usuario_id: usuarioId, limit: 1000 })
      .pipe(
        map(response => this.apiService.extractItems(response))
      );
  }

  /**
   * Get service orders in date range
   */
  getOrdensByDateRange(dataInicio: string, dataFim: string): Observable<OrdemServico[]> {
    return this.getOrdensServico({ 
      data_inicio: dataInicio, 
      data_fim: dataFim, 
      limit: 1000 
    }).pipe(
      map(response => this.apiService.extractItems(response))
    );
  }

  /**
   * Add service to OS
   */
  addServico(servicoData: ServicoRealizadoCreate): Observable<ServicoRealizado> {
    return this.apiService.post<ApiResponse<ServicoRealizado>>('/servicos-realizados', servicoData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao adicionar serviço');
        })
      );
  }

  /**
   * Remove service from OS
   */
  removeServico(servicoId: number): Observable<boolean> {
    return this.apiService.delete<ApiResponse>(`/servicos-realizados/${servicoId}`)
      .pipe(
        map(response => {
          if (response.success) {
            return true;
          }
          throw new Error(response.message || 'Erro ao remover serviço');
        })
      );
  }

  /**
   * Add part to OS
   */
  addPeca(pecaData: PecaUtilizadaCreate): Observable<PecaUtilizada> {
    return this.apiService.post<ApiResponse<PecaUtilizada>>('/pecas-utilizadas', pecaData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao adicionar peça');
        })
      );
  }

  /**
   * Remove part from OS
   */
  removePeca(pecaId: number): Observable<boolean> {
    return this.apiService.delete<ApiResponse>(`/pecas-utilizadas/${pecaId}`)
      .pipe(
        map(response => {
          if (response.success) {
            return true;
          }
          throw new Error(response.message || 'Erro ao remover peça');
        })
      );
  }

  /**
   * Close service order
   */
  encerrarOS(osId: number, encerrarData: {
    nome_mecanico: string;
    data_da_manutencao: string;
    tempo_total: string;
    modelo_veiculo: string;
  }): Observable<any> {
    const requestData = {
      ...encerrarData,
      abrir_os_id: osId
    };

    return this.apiService.post<ApiResponse<any>>('/encerrar-os', requestData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao encerrar ordem de serviço');
        })
      );
  }

  /**
   * Register vehicle withdrawal
   */
  registrarRetirada(encerramentoId: number, retiradaData: {
    nome: string;
    data: string;
  }): Observable<any> {
    const requestData = {
      ...retiradaData,
      encerrar_os_id: encerramentoId
    };

    return this.apiService.post<ApiResponse<any>>('/retirada-viatura', requestData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao registrar retirada');
        })
      );
  }

  /**
   * Get OS statistics
   */
  getOSStats(): Observable<{
    total: number;
    abertas: number;
    fechadas: number;
    retiradas: number;
    porTipo: { [key: string]: number };
    porMes: { [key: string]: number };
  }> {
    return this.getOrdensServico({ limit: 1000 })
      .pipe(
        map(response => {
          const ordens = this.apiService.extractItems(response);
          const total = ordens.length;
          const abertas = ordens.filter(os => os.situacao_os === 'ABERTA').length;
          const fechadas = ordens.filter(os => os.situacao_os === 'FECHADA').length;
          const retiradas = ordens.filter(os => os.situacao_os === 'RETIRADA').length;
          
          const porTipo: { [key: string]: number } = {};
          const porMes: { [key: string]: number } = {};
          
          ordens.forEach(ordem => {
            // Por tipo de manutenção
            porTipo[ordem.manutencao] = (porTipo[ordem.manutencao] || 0) + 1;
            
            // Por mês
            const mes = new Date(ordem.created_at).toLocaleDateString('pt-BR', { 
              year: 'numeric', 
              month: 'long' 
            });
            porMes[mes] = (porMes[mes] || 0) + 1;
          });

          return { total, abertas, fechadas, retiradas, porTipo, porMes };
        })
      );
  }

  /**
   * Search service orders
   */
  searchOrdens(searchTerm: string): Observable<OrdemServico[]> {
    return this.getOrdensServico({ search: searchTerm, limit: 100 })
      .pipe(
        map(response => this.apiService.extractItems(response))
      );
  }

  /**
   * Get recent service orders
   */
  getRecentOrdens(limit: number = 10): Observable<OrdemServico[]> {
    return this.getOrdensServico({ limit })
      .pipe(
        map(response => this.apiService.extractItems(response))
      );
  }

  /**
   * Get OS history for vehicle
   */
  getHistoricoVeiculo(veiculoId: number): Observable<OrdemServico[]> {
    return this.getOrdensByVeiculo(veiculoId)
      .pipe(
        map(ordens => ordens.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ))
      );
  }
}
