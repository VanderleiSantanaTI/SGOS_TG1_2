export interface PecaUtilizada {
  id: number;
  ordem_servico_id: number;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  created_at: string;
  updated_at: string;
}

export interface PecaUtilizadaCreate {
  ordem_servico_id: number;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
}

export interface PecaUtilizadaUpdate {
  descricao?: string;
  quantidade?: number;
  valor_unitario?: number;
}
