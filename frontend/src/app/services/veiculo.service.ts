import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService, QueryParams } from './api.service';
import { 
  Veiculo, 
  VeiculoCreate, 
  VeiculoUpdate, 
  ApiResponse, 
  PaginatedResponse 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class VeiculoService {
  private readonly endpoint = '/veiculos';

  constructor(private apiService: ApiService) {}

  /**
   * Get all vehicles with pagination
   */
  getVeiculos(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    marca?: string;
    status?: string;
    su_cia_viatura?: string;
  }): Observable<PaginatedResponse<Veiculo>> {
    const queryParams: QueryParams = {
      skip: params?.skip || 0,
      limit: params?.limit || 10,
      ...(params?.search && { search: params.search }),
      ...(params?.marca && { marca: params.marca }),
      ...(params?.status && { status: params.status }),
      ...(params?.su_cia_viatura && { su_cia_viatura: params.su_cia_viatura })
    };

    return this.apiService.getPaginated<Veiculo>(this.endpoint, queryParams);
  }

  /**
   * Get vehicle by ID
   */
  getVeiculo(id: number): Observable<Veiculo> {
    return this.apiService.get<ApiResponse<Veiculo>>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Veículo não encontrado');
        })
      );
  }

  /**
   * Create new vehicle
   */
  createVeiculo(veiculoData: VeiculoCreate): Observable<Veiculo> {
    return this.apiService.post<ApiResponse<Veiculo>>(this.endpoint, veiculoData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao criar veículo');
        })
      );
  }

  /**
   * Update vehicle
   */
  updateVeiculo(id: number, veiculoData: VeiculoUpdate): Observable<Veiculo> {
    return this.apiService.put<ApiResponse<Veiculo>>(`${this.endpoint}/${id}`, veiculoData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao atualizar veículo');
        })
      );
  }

  /**
   * Delete vehicle
   */
  deleteVeiculo(id: number): Observable<boolean> {
    return this.apiService.delete<ApiResponse>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => {
          if (response.success) {
            return true;
          }
          throw new Error(response.message || 'Erro ao deletar veículo');
        })
      );
  }

  /**
   * Search vehicles by plate
   */
  searchByPlaca(placa: string): Observable<Veiculo[]> {
    return this.getVeiculos({ search: placa, limit: 10 })
      .pipe(
        map(response => this.apiService.extractItems(response))
      );
  }

  /**
   * Search vehicles by patrimonio
   */
  searchByPatrimonio(patrimonio: string): Observable<Veiculo[]> {
    return this.getVeiculos({ search: patrimonio, limit: 10 })
      .pipe(
        map(response => this.apiService.extractItems(response))
      );
  }

  /**
   * Get vehicles by status
   */
  getVeiculosByStatus(status: 'ATIVO' | 'MANUTENCAO' | 'INATIVO'): Observable<Veiculo[]> {
    return this.getVeiculos({ status, limit: 1000 })
      .pipe(
        map(response => this.apiService.extractItems(response))
      );
  }

  /**
   * Get active vehicles only
   */
  getActiveVeiculos(): Observable<Veiculo[]> {
    return this.getVeiculosByStatus('ATIVO');
  }

  /**
   * Get vehicles by company
   */
  getVeiculosByCia(su_cia_viatura: string): Observable<Veiculo[]> {
    return this.getVeiculos({ su_cia_viatura, limit: 1000 })
      .pipe(
        map(response => this.apiService.extractItems(response))
      );
  }

  /**
   * Get available brands
   */
  getMarcas(): Observable<string[]> {
    return this.getVeiculos({ limit: 1000 })
      .pipe(
        map(response => {
          const veiculos = this.apiService.extractItems(response);
          const marcas = [...new Set(veiculos.map(v => v.marca))];
          return marcas.sort();
        })
      );
  }

  /**
   * Get available companies
   */
  getCompanias(): Observable<string[]> {
    return this.getVeiculos({ limit: 1000 })
      .pipe(
        map(response => {
          const veiculos = this.apiService.extractItems(response);
          const companias = [...new Set(veiculos.map(v => v.su_cia_viatura))];
          return companias.sort();
        })
      );
  }

  /**
   * Validate plate availability
   */
  validatePlaca(placa: string, excludeId?: number): Observable<boolean> {
    return this.searchByPlaca(placa)
      .pipe(
        map(veiculos => {
          const existingVeiculo = veiculos.find(v => 
            v.placa.toUpperCase() === placa.toUpperCase()
          );
          
          if (!existingVeiculo) return true;
          if (excludeId && existingVeiculo.id === excludeId) return true;
          
          return false;
        })
      );
  }

  /**
   * Validate patrimonio availability
   */
  validatePatrimonio(patrimonio: string, excludeId?: number): Observable<boolean> {
    return this.searchByPatrimonio(patrimonio)
      .pipe(
        map(veiculos => {
          const existingVeiculo = veiculos.find(v => 
            v.patrimonio === patrimonio
          );
          
          if (!existingVeiculo) return true;
          if (excludeId && existingVeiculo.id === excludeId) return true;
          
          return false;
        })
      );
  }

  /**
   * Update vehicle status
   */
  updateStatus(id: number, status: 'ATIVO' | 'MANUTENCAO' | 'INATIVO'): Observable<Veiculo> {
    const updateData: VeiculoUpdate = { status };
    return this.updateVeiculo(id, updateData);
  }

  /**
   * Get vehicle statistics
   */
  getVeiculoStats(): Observable<{
    total: number;
    ativos: number;
    manutencao: number;
    inativos: number;
    porMarca: { [key: string]: number };
    porCia: { [key: string]: number };
  }> {
    return this.getVeiculos({ limit: 1000 })
      .pipe(
        map(response => {
          const veiculos = this.apiService.extractItems(response);
          const total = veiculos.length;
          const ativos = veiculos.filter(v => v.status === 'ATIVO').length;
          const manutencao = veiculos.filter(v => v.status === 'MANUTENCAO').length;
          const inativos = veiculos.filter(v => v.status === 'INATIVO').length;
          
          const porMarca: { [key: string]: number } = {};
          const porCia: { [key: string]: number } = {};
          
          veiculos.forEach(veiculo => {
            porMarca[veiculo.marca] = (porMarca[veiculo.marca] || 0) + 1;
            porCia[veiculo.su_cia_viatura] = (porCia[veiculo.su_cia_viatura] || 0) + 1;
          });

          return { total, ativos, manutencao, inativos, porMarca, porCia };
        })
      );
  }

  /**
   * Get maintenance report for vehicle
   */
  getRelatorioManutencao(id: number): Observable<any> {
    return this.apiService.get<ApiResponse<any>>(`${this.endpoint}/${id}/relatorio-manutencao`);
  }
}
