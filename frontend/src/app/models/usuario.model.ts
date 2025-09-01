export interface Usuario {
  id: number;
  username: string;
  email: string;
  nome_completo: string;
  perfil: 'ADMIN' | 'SUPERVISOR' | 'MECANICO' | 'USUARIO';
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsuarioCreate {
  username: string;
  email: string;
  password: string;
  nome_completo: string;
  perfil: 'ADMIN' | 'SUPERVISOR' | 'MECANICO' | 'USUARIO';
  ativo?: boolean;
}

export interface UsuarioUpdate {
  username?: string;
  email?: string;
  password?: string;
  nome_completo?: string;
  perfil?: 'ADMIN' | 'SUPERVISOR' | 'MECANICO' | 'USUARIO';
  ativo?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  success?: boolean;
  message: string;
  timestamp: string;
  data: {
    access_token: string;
    token_type: string;
    user: Usuario;
  };
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}
