import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse, PaginatedResponse, ErrorResponse } from '../models';

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: QueryParams): Observable<T> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * GET request with pagination
   */
  getPaginated<T>(endpoint: string, params?: QueryParams): Observable<PaginatedResponse<T>> {
    return this.get<PaginatedResponse<T>>(endpoint, params);
  }

  /**
   * Extract data from API response
   */
  extractData<T>(response: ApiResponse<T>): T | undefined {
    return response.data;
  }

  /**
   * Extract items from paginated response
   */
  extractItems<T>(response: PaginatedResponse<T>): T[] {
    return response.data?.items || [];
  }

  /**
   * Extract pagination info
   */
  extractPagination<T>(response: PaginatedResponse<T>) {
    // Suporta dois formatos:
    // 1) data: { items: T[], pagination: { total, page, size, pages } }
    // 2) data: { items: T[], total, page, size, pages }
    const data: any = response?.data || {};
    if (data.pagination) {
      return data.pagination;
    }
    if (
      typeof data.total === 'number' &&
      typeof data.page === 'number' &&
      typeof data.size === 'number' &&
      typeof data.pages === 'number'
    ) {
      return {
        total: data.total,
        page: data.page,
        size: data.size,
        pages: data.pages
      };
    }
    return { total: 0, page: 1, size: 10, pages: 0 };
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro desconhecido';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Dados inválidos';
            break;
          case 401:
            errorMessage = 'Não autorizado';
            break;
          case 403:
            errorMessage = 'Acesso negado';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado';
            break;
          case 422:
            errorMessage = 'Erro de validação';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor';
            break;
          default:
            errorMessage = `Erro ${error.status}: ${error.message}`;
        }
      }
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Build query string from params
   */
  private buildQueryString(params: QueryParams): string {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null) {
        queryParams.set(key, value.toString());
      }
    });

    return queryParams.toString();
  }

  /**
   * Check if response is successful
   */
  isSuccessResponse<T>(response: ApiResponse<T>): boolean {
    return response.success === true;
  }

  /**
   * Get error message from response
   */
  getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Erro desconhecido';
  }
}
