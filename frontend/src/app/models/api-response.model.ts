export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error_code?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    // Backend atual retorna estes campos de forma plana
    total: number;
    page: number;
    size: number;
    pages: number;
    // Mas mantemos compat com 'pagination' caso exista
    pagination?: {
      total: number;
      page: number;
      size: number;
      pages: number;
    };
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  error_code: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
  success: boolean;
}
