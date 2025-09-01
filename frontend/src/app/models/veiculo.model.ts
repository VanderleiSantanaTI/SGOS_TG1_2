export interface Veiculo {
  id: number;
  marca: string;
  modelo: string;
  placa: string;
  su_cia_viatura: string;
  patrimonio: string;
  ano_fabricacao?: string;
  cor?: string;
  chassi?: string;
  motor?: string;
  combustivel?: string;
  observacoes?: string;
  status: 'ATIVO' | 'MANUTENCAO' | 'INATIVO';
  created_at: string;
  updated_at: string;
}

export interface VeiculoCreate {
  marca: string;
  modelo: string;
  placa: string;
  su_cia_viatura: string;
  patrimonio: string;
  ano_fabricacao?: string;
  cor?: string;
  chassi?: string;
  motor?: string;
  combustivel?: string;
  observacoes?: string;
  status?: 'ATIVO' | 'MANUTENCAO' | 'INATIVO';
}

export interface VeiculoUpdate {
  marca?: string;
  modelo?: string;
  placa?: string;
  su_cia_viatura?: string;
  patrimonio?: string;
  ano_fabricacao?: string;
  cor?: string;
  chassi?: string;
  motor?: string;
  combustivel?: string;
  observacoes?: string;
  status?: 'ATIVO' | 'MANUTENCAO' | 'INATIVO';
}
