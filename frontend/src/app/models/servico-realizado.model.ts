export interface ServicoRealizado {
  id: number;
  ordem_servico_id: number;
  descricao: string;
  tempo_execucao: string;
  valor: number;
  created_at: string;
  updated_at: string;
}

export interface ServicoRealizadoCreate {
  ordem_servico_id: number;
  descricao: string;
  tempo_execucao: string;
  valor: number;
}

export interface ServicoRealizadoUpdate {
  descricao?: string;
  tempo_execucao?: string;
  valor?: number;
}
