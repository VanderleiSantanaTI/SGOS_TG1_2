import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  
  constructor() { }

  /**
   * Obtém a URL base da API
   */
  getApiUrl(): string {
    return environment.apiUrl;
  }

  /**
   * Obtém a URL completa de um endpoint
   */
  getEndpointUrl(endpoint: string): string {
    return `${environment.apiUrl}${endpoint}`;
  }

  /**
   * Obtém as opções de headers com autenticação
   */
  getAuthHeaders(): any {
    const token = localStorage.getItem(environment.storage.token);
    const options: any = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return options;
  }

  /**
   * Obtém as configurações de paginação padrão
   */
  getPaginationConfig(): any {
    return {
      skip: 0,
      limit: environment.pagination.defaultPageSize
    };
  }

  /**
   * Obtém as configurações de busca
   */
  getSearchConfig(): any {
    return {
      debounceTime: environment.search.debounceTime,
      minSearchLength: environment.search.minSearchLength
    };
  }

  /**
   * Obtém as configurações de toast
   */
  getToastConfig(): any {
    return environment.toast;
  }

  /**
   * Obtém as chaves de storage
   */
  getStorageKeys(): any {
    return environment.storage;
  }

  /**
   * Verifica se está em modo de produção
   */
  isProduction(): boolean {
    return environment.production;
  }

  /**
   * Obtém informações da aplicação
   */
  getAppInfo(): any {
    return {
      name: environment.appName,
      version: environment.version
    };
  }
}
