import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ApiService, QueryParams } from './api.service';
import { 
  Usuario, 
  UsuarioCreate, 
  UsuarioUpdate, 
  ApiResponse, 
  PaginatedResponse 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly endpoint = '/usuarios';

  constructor(private apiService: ApiService) {}

  /**
   * Get all users with pagination
   */
  getUsuarios(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    perfil?: string;
    ativo?: boolean;
  }): Observable<PaginatedResponse<Usuario>> {
    const queryParams: QueryParams = {
      skip: params?.skip || 0,
      limit: params?.limit || 10,
      ...(params?.search && { search: params.search }),
      ...(params?.perfil && { perfil: params.perfil }),
      ...(params?.ativo !== undefined && { ativo: params.ativo })
    };

    return this.apiService.getPaginated<Usuario>(this.endpoint, queryParams);
  }

  /**
   * Get user by ID
   */
  getUsuario(id: number): Observable<Usuario> {
    return this.apiService.get<ApiResponse<Usuario>>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Usuário não encontrado');
        })
      );
  }

  /**
   * Create new user
   */
  createUsuario(userData: UsuarioCreate): Observable<Usuario> {
    return this.apiService.post<ApiResponse<Usuario>>(this.endpoint, userData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao criar usuário');
        })
      );
  }

  /**
   * Update user
   */
  updateUsuario(id: number, userData: UsuarioUpdate): Observable<Usuario> {
    return this.apiService.put<ApiResponse<Usuario>>(`${this.endpoint}/${id}`, userData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Erro ao atualizar usuário');
        })
      );
  }

  /**
   * Delete user
   */
  deleteUsuario(id: number): Observable<boolean> {
    return this.apiService.delete<ApiResponse>(`${this.endpoint}/${id}`)
      .pipe(
        map(response => {
          if (response.success) {
            return true;
          }
          throw new Error(response.message || 'Erro ao deletar usuário');
        })
      );
  }

  /**
   * Toggle user active status
   */
  toggleUsuarioStatus(id: number): Observable<Usuario> {
    return this.getUsuario(id).pipe(
      switchMap(usuario => {
        const updateData: UsuarioUpdate = {
          ativo: !usuario.ativo
        };
        return this.updateUsuario(id, updateData);
      })
    );
  }

  /**
   * Get users by role
   */
  getUsuariosByPerfil(perfil: string): Observable<Usuario[]> {
    return this.getUsuarios({ perfil, limit: 1000 })
      .pipe(
        map(response => this.apiService.extractItems(response))
      );
  }

  /**
   * Get active users only
   */
  getActiveUsuarios(): Observable<Usuario[]> {
    return this.getUsuarios({ ativo: true, limit: 1000 })
      .pipe(
        map(response => this.apiService.extractItems(response))
      );
  }

  /**
   * Search users by name or username
   */
  searchUsuarios(searchTerm: string): Observable<Usuario[]> {
    return this.getUsuarios({ search: searchTerm, limit: 100 })
      .pipe(
        map(response => this.apiService.extractItems(response))
      );
  }

  /**
   * Get mechanics for assignment
   */
  getMecanicos(): Observable<Usuario[]> {
    return this.getUsuariosByPerfil('MECANICO');
  }

  /**
   * Get supervisors
   */
  getSupervisores(): Observable<Usuario[]> {
    return this.getUsuariosByPerfil('SUPERVISOR');
  }

  /**
   * Validate username availability
   */
  validateUsername(username: string, excludeId?: number): Observable<boolean> {
    return this.searchUsuarios(username)
      .pipe(
        map(usuarios => {
          const existingUser = usuarios.find(u => 
            u.username.toLowerCase() === username.toLowerCase()
          );
          
          if (!existingUser) return true;
          if (excludeId && existingUser.id === excludeId) return true;
          
          return false;
        })
      );
  }

  /**
   * Validate email availability
   */
  validateEmail(email: string, excludeId?: number): Observable<boolean> {
    return this.searchUsuarios(email)
      .pipe(
        map(usuarios => {
          const existingUser = usuarios.find(u => 
            u.email.toLowerCase() === email.toLowerCase()
          );
          
          if (!existingUser) return true;
          if (excludeId && existingUser.id === excludeId) return true;
          
          return false;
        })
      );
  }

  /**
   * Get user statistics
   */
  getUserStats(): Observable<{
    total: number;
    ativos: number;
    inativos: number;
    porPerfil: { [key: string]: number };
  }> {
    return this.getUsuarios({ limit: 1000 })
      .pipe(
        map(response => {
          const usuarios = this.apiService.extractItems(response);
          const total = usuarios.length;
          const ativos = usuarios.filter(u => u.ativo).length;
          const inativos = total - ativos;
          
          const porPerfil: { [key: string]: number } = {};
          usuarios.forEach(usuario => {
            porPerfil[usuario.perfil] = (porPerfil[usuario.perfil] || 0) + 1;
          });

          return { total, ativos, inativos, porPerfil };
        })
      );
  }
}
