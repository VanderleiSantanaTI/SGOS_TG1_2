import { Usuario } from './usuario.model';
import { Veiculo } from './veiculo.model';
import { ServicoRealizado } from './servico-realizado.model';
import { PecaUtilizada } from './peca-utilizada.model';

export interface OrdemServico {
  id: number;
  data: string;
  veiculo_id: number;
  hodometro: string;
  problema_apresentado: string;
  sistema_afetado: string;
  causa_da_avaria: string;
  manutencao: 'PREVENTIVA' | 'CORRETIVA';
  usuario_id: number;
  perfil: string;
  situacao_os: 'ABERTA' | 'FECHADA' | 'RETIRADA';
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  veiculo?: Veiculo;
  usuario?: Usuario;
  servicos_realizados?: ServicoRealizado[];
  pecas_utilizadas?: PecaUtilizada[];
}

export interface OrdemServicoCreate {
  data: string;
  veiculo_id: number;
  hodometro: string;
  problema_apresentado: string;
  sistema_afetado: string;
  causa_da_avaria: string;
  manutencao: 'PREVENTIVA' | 'CORRETIVA';
}

export interface OrdemServicoUpdate {
  data?: string;
  veiculo_id?: number;
  hodometro?: string;
  problema_apresentado?: string;
  sistema_afetado?: string;
  causa_da_avaria?: string;
  manutencao?: 'PREVENTIVA' | 'CORRETIVA';
  situacao_os?: 'ABERTA' | 'FECHADA' | 'RETIRADA';
}

export interface OrdemServicoDetalhada extends OrdemServico {
  servicos_realizados: ServicoRealizado[];
  pecas_utilizadas: PecaUtilizada[];
  tempo_total_servicos: string;
  custo_total_pecas: number;
}
