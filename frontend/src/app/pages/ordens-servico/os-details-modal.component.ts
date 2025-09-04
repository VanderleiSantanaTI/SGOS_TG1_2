import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface OrdemServico {
  id: number;
  data: string;
  veiculo_id: number;
  hodometro: string;
  problema_apresentado: string;
  sistema_afetado: string;
  causa_da_avaria: string;
  manutencao: 'PREVENTIVA' | 'CORRETIVA';
  situacao_os: 'ABERTA' | 'FECHADA' | 'RETIRADA';
  usuario_id: number;
  perfil: string;
  created_at: string;
  veiculo?: {
    id: number;
    marca: string;
    modelo: string;
    placa: string;
    patrimonio: string;
  };
  usuario?: {
    id: number;
    nome: string;
    username: string;
    perfil: string;
  };
  encerrar_os?: {
    id: number;
    nome_mecanico: string;
    data_da_manutencao: string;
    situacao: string;
    tempo_total: string;
    usuario_id: number;
    abrir_os_id: number;
    modelo_veiculo: string;
    created_at: string;
  };
  encerramentos?: {
    id: number;
    nome_mecanico: string;
    data_da_manutencao: string;
    situacao: string;
    tempo_total: string;
    usuario_id: number;
    abrir_os_id: number;
    modelo_veiculo: string;
    created_at: string;
  }[];
  retirada_viatura?: {
    id: number;
    nome: string;
    data: string;
    encerrar_os_id: number;
    usuario_id: number;
    created_at: string;
    usuario?: {
      id: number;
      username: string;
      nome_completo: string;
    };
  };
}

interface PecaUtilizada {
  id: number;
  peca_utilizada: string;
  num_ficha: string;
  qtd: string;
  abrir_os_id: number;
  usuario_id: number;
  created_at: string;
  usuario?: {
    id: number;
    username: string;
    nome_completo: string;
  };
}

interface ServicoRealizado {
  id: number;
  servico_realizado: string;
  tempo_de_servico_realizado: string;
  abrir_os_id: number;
  usuario_id: number;
  created_at: string;
  usuario?: {
    id: number;
    username: string;
    nome_completo: string;
  };
}

@Component({
  selector: 'app-os-details-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>OS #{{ordemServico.id}} - Detalhes</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="modal-container">
        
        <!-- Loading State -->
        <div *ngIf="loading || loadingCompleteData" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Carregando detalhes...</p>
        </div>

        <!-- OS Information -->
        <div *ngIf="!loading && !loadingCompleteData && ordemServico" class="os-info-section">
          <ion-card>
            <ion-card-header>
              <ion-card-title>
                <ion-icon name="construct-outline"></ion-icon>
                Informações da Ordem de Serviço
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <ion-icon name="car-outline"></ion-icon>
                  <div class="info-content">
                    <span class="info-label">Veículo</span>
                    <span class="info-value">{{getVeiculoDisplayName()}}</span>
                  </div>
                </div>
                
                <div class="info-item">
                  <ion-icon name="calendar-outline"></ion-icon>
                  <div class="info-content">
                    <span class="info-label">Data</span>
                    <span class="info-value">{{formatDate(ordemServico.created_at)}}</span>
                  </div>
                </div>
                
                <div class="info-item">
                  <ion-badge [color]="getStatusColor(ordemServico.situacao_os)" class="status-badge">
                    {{getStatusDisplayName(ordemServico.situacao_os)}}
                  </ion-badge>
                </div>
                
                <!-- Close OS Button (only for ABERTA status) -->
                <div class="info-item" *ngIf="ordemServico.situacao_os === 'ABERTA'">
                  <ion-button 
                    expand="block" 
                    color="success" 
                    (click)="showCloseOSForm()"
                    class="close-os-button">
                    <ion-icon name="checkmark-circle-outline" slot="start"></ion-icon>
                    Fechar OS
                  </ion-button>
                </div>
                
                <!-- Withdraw Vehicle Button (only for FECHADA status) -->
                <div class="info-item" *ngIf="ordemServico.situacao_os === 'FECHADA'">
                  <ion-button 
                    expand="block" 
                    color="primary" 
                    (click)="showWithdrawVehicleForm()"
                    class="withdraw-vehicle-button">
                    <ion-icon name="car-outline" slot="start"></ion-icon>
                    Retirar Veículo
                  </ion-button>
                </div>
                
                <div class="info-item">
                  <ion-icon name="warning-outline"></ion-icon>
                  <div class="info-content">
                    <span class="info-label">Problema</span>
                    <span class="info-value">{{ordemServico.problema_apresentado}}</span>
                  </div>
                </div>
                
                <div class="info-item">
                  <ion-icon name="cog-outline"></ion-icon>
                  <div class="info-content">
                    <span class="info-label">Sistema Afetado</span>
                    <span class="info-value">{{ordemServico.sistema_afetado}}</span>
                  </div>
                </div>
                
                <div class="info-item">
                  <ion-icon name="build-outline"></ion-icon>
                  <div class="info-content">
                    <span class="info-label">Tipo de Manutenção</span>
                    <span class="info-value">{{getMaintenanceDisplayName(ordemServico.manutencao)}}</span>
                  </div>
                </div>
                
                <div class="info-item">
                  <ion-icon name="speedometer-outline"></ion-icon>
                  <div class="info-content">
                    <span class="info-label">Hodômetro</span>
                    <span class="info-value">{{ordemServico.hodometro}} km</span>
                  </div>
                </div>
                
                <div class="info-item" *ngIf="ordemServico.causa_da_avaria">
                  <ion-icon name="information-circle-outline"></ion-icon>
                  <div class="info-content">
                    <span class="info-label">Causa da Avaria</span>
                    <span class="info-value">{{ordemServico.causa_da_avaria}}</span>
                  </div>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Withdrawal Information (only for RETIRADA status) -->
        <div *ngIf="!loading && !loadingCompleteData && ordemServico.situacao_os === 'RETIRADA' && ordemServico.retirada_viatura" class="withdrawal-info-section">
          <ion-card>
            <ion-card-header>
              <ion-card-title>
                <ion-icon name="car-outline"></ion-icon>
                Informações da Retirada
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <ion-icon name="person-outline"></ion-icon>
                  <div class="info-content">
                    <span class="info-label">Responsável pela Retirada</span>
                    <span class="info-value">{{ordemServico.retirada_viatura.nome}}</span>
                  </div>
                </div>
                
                <div class="info-item">
                  <ion-icon name="calendar-outline"></ion-icon>
                  <div class="info-content">
                    <span class="info-label">Data da Retirada</span>
                    <span class="info-value">{{formatDate(ordemServico.retirada_viatura.data)}}</span>
                  </div>
                </div>
                
                <div class="info-item" *ngIf="ordemServico.retirada_viatura.usuario">
                  <ion-icon name="person-circle-outline"></ion-icon>
                  <div class="info-content">
                    <span class="info-label">Registrado por</span>
                    <span class="info-value">{{ordemServico.retirada_viatura.usuario.nome_completo}}</span>
                  </div>
                </div>
                
                <div class="info-item">
                  <ion-icon name="time-outline"></ion-icon>
                  <div class="info-content">
                    <span class="info-label">Data do Registro</span>
                    <span class="info-value">{{formatDate(ordemServico.retirada_viatura.created_at)}}</span>
                  </div>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Close OS Form -->
        <div *ngIf="showCloseForm" class="close-form-section">
          <ion-card>
            <ion-card-header>
              <ion-card-title>
                <ion-icon name="checkmark-circle-outline"></ion-icon>
                Fechar Ordem de Serviço
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <form [formGroup]="closeOSForm" class="close-form">
                
                <ion-item fill="outline">
                  <ion-label position="stacked">Nome do Mecânico *</ion-label>
                  <ion-input 
                    formControlName="nome_mecanico"
                    placeholder="Ex: João Silva"
                    required>
                  </ion-input>
                </ion-item>

                <ion-item fill="outline">
                  <ion-label position="stacked">Data da Manutenção *</ion-label>
                  <ion-datetime 
                    formControlName="data_da_manutencao"
                    display-format="DD/MM/YYYY"
                    placeholder="Selecione a data"
                    required>
                  </ion-datetime>
                </ion-item>

                <ion-item fill="outline">
                  <ion-label position="stacked">
                    Tempo Total *
                    <span class="auto-calculated" *ngIf="servicosRealizados.length > 0">
                      (Calculado automaticamente)
                    </span>
                  </ion-label>
                  <ion-input 
                    formControlName="tempo_total"
                    placeholder="Ex: 02:30"
                    maxlength="5"
                    pattern="[0-9]{2}:[0-9]{2}">
                  </ion-input>
                </ion-item>

                <ion-item fill="outline">
                  <ion-label position="stacked">Modelo do Veículo</ion-label>
                  <ion-input 
                    formControlName="modelo_veiculo"
                    placeholder="Ex: Hilux"
                    readonly>
                  </ion-input>
                </ion-item>

                <!-- Action Buttons -->
                <div class="form-actions">
                  <ion-button 
                    expand="block" 
                    (click)="closeOS()"
                    [disabled]="closeOSForm.invalid"
                    color="success">
                    <ion-icon name="checkmark-outline" slot="start"></ion-icon>
                    Fechar OS
                  </ion-button>
                  <ion-button 
                    expand="block" 
                    fill="outline" 
                    (click)="hideCloseOSForm()">
                    <ion-icon name="close-outline" slot="start"></ion-icon>
                    Cancelar
                  </ion-button>
                </div>

              </form>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Withdraw Vehicle Form -->
        <div *ngIf="showWithdrawForm" class="withdraw-form-section">
          <ion-card>
            <ion-card-header>
              <ion-card-title>
                <ion-icon name="car-outline"></ion-icon>
                Responsável pela retirada
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <form [formGroup]="withdrawVehicleForm" class="withdraw-form">
                
                <ion-item fill="outline">
                  <ion-label position="stacked">Nome *</ion-label>
                  <ion-input 
                    formControlName="nome"
                    placeholder="Ex: João Silva"
                    required>
                  </ion-input>
                </ion-item>

                <ion-item fill="outline">
                  <ion-label position="stacked">Data da Retirada *</ion-label>
                  <ion-datetime 
                    formControlName="data"
                    display-format="DD/MM/YYYY"
                    placeholder="Selecione a data"
                    required>
                  </ion-datetime>
                </ion-item>

                <!-- Action Buttons -->
                <div class="form-actions">
                  <ion-button 
                    expand="block" 
                    (click)="withdrawVehicle()"
                    [disabled]="withdrawVehicleForm.invalid"
                    color="primary">
                    <ion-icon name="car-outline" slot="start"></ion-icon>
                    Retirar Veículo
                  </ion-button>
                  <ion-button 
                    expand="block" 
                    fill="outline" 
                    (click)="hideWithdrawVehicleForm()">
                    <ion-icon name="close-outline" slot="start"></ion-icon>
                    Cancelar
                  </ion-button>
                </div>

              </form>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Parts Section -->
        <div *ngIf="!loading && !loadingCompleteData" class="parts-section">
          <ion-card>
            <ion-card-header>
              <ion-card-title>
                <ion-icon name="hardware-chip-outline"></ion-icon>
                Peças Utilizadas
                <ion-badge color="primary" *ngIf="pecasUtilizadas.length > 0">
                  {{pecasUtilizadas.length}}
                </ion-badge>
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div *ngIf="pecasUtilizadas.length === 0" class="no-data">
                <ion-icon name="hardware-chip-outline"></ion-icon>
                <p>Nenhuma peça cadastrada para esta OS</p>
              </div>
              
              <div *ngIf="pecasUtilizadas.length > 0" class="items-list">
                <ion-item *ngFor="let peca of pecasUtilizadas" class="item-card">
                  <ion-icon name="hardware-chip" slot="start" color="primary"></ion-icon>
                  <ion-label>
                    <h3>{{peca.peca_utilizada}}</h3>
                    <p><strong>Ficha:</strong> {{peca.num_ficha}}</p>
                    <p><strong>Quantidade:</strong> {{peca.qtd}}</p>
                    <p *ngIf="peca.usuario"><strong>Cadastrado por:</strong> {{peca.usuario.nome_completo}}</p>
                    <p><strong>Data:</strong> {{formatDate(peca.created_at)}}</p>
                  </ion-label>
                </ion-item>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Services Section -->
        <div *ngIf="!loading && !loadingCompleteData" class="services-section">
          <ion-card>
            <ion-card-header>
              <ion-card-title>
                <ion-icon name="construct-outline"></ion-icon>
                Serviços Realizados
                <ion-badge color="success" *ngIf="servicosRealizados.length > 0">
                  {{servicosRealizados.length}}
                </ion-badge>
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div *ngIf="servicosRealizados.length === 0" class="no-data">
                <ion-icon name="construct-outline"></ion-icon>
                <p>Nenhum serviço cadastrado para esta OS</p>
              </div>
              
              <div *ngIf="servicosRealizados.length > 0" class="items-list">
                <ion-item *ngFor="let servico of servicosRealizados" class="item-card">
                  <ion-icon name="construct" slot="start" color="success"></ion-icon>
                  <ion-label>
                    <h3>{{servico.servico_realizado}}</h3>
                    <p><strong>Tempo:</strong> {{servico.tempo_de_servico_realizado}}</p>
                    <p *ngIf="servico.usuario"><strong>Realizado por:</strong> {{servico.usuario.nome_completo}}</p>
                    <p><strong>Data:</strong> {{formatDate(servico.created_at)}}</p>
                  </ion-label>
                </ion-item>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Summary Section -->
        <div *ngIf="!loading && !loadingCompleteData && (pecasUtilizadas.length > 0 || servicosRealizados.length > 0)" class="summary-section">
          <ion-card>
            <ion-card-header>
              <ion-card-title>
                <ion-icon name="analytics-outline"></ion-icon>
                Resumo
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="summary-grid">
                <div class="summary-item">
                  <ion-icon name="hardware-chip-outline" color="primary"></ion-icon>
                  <span class="summary-number">{{pecasUtilizadas.length}}</span>
                  <span class="summary-label">Peças</span>
                </div>
                <div class="summary-item">
                  <ion-icon name="construct-outline" color="success"></ion-icon>
                  <span class="summary-number">{{servicosRealizados.length}}</span>
                  <span class="summary-label">Serviços</span>
                </div>
                <div class="summary-item">
                  <ion-icon name="time-outline" color="warning"></ion-icon>
                  <span class="summary-number">{{getTotalTime()}}</span>
                  <span class="summary-label">Tempo Total</span>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Export PDF Button (only for RETIRADA status) -->
        <div *ngIf="!loading && !loadingCompleteData && ordemServico.situacao_os === 'RETIRADA'" class="export-pdf-section">
          <ion-card>
            <ion-card-content>
              <ion-button 
                expand="block" 
                color="primary" 
                (click)="exportToPDF()"
                class="export-pdf-button">
                <ion-icon name="download-outline" slot="start"></ion-icon>
                Exportar Relatório PDF
              </ion-button>
            </ion-card-content>
          </ion-card>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .modal-container {
      padding: 16px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      
      ion-spinner {
        margin-bottom: 16px;
      }
      
      p {
        color: var(--ion-color-medium);
        margin: 0;
      }
    }

    .os-info-section,
    .withdrawal-info-section,
    .close-form-section,
    .withdraw-form-section,
    .parts-section,
    .services-section,
    .summary-section {
      margin-bottom: 16px;
    }

    .close-os-button,
    .withdraw-vehicle-button {
      margin-top: 8px;
      --border-radius: 8px;
    }

    .export-pdf-section {
      margin-top: 20px;
      
      .export-pdf-button {
        --border-radius: 8px;
        --padding-top: 12px;
        --padding-bottom: 12px;
        font-weight: 600;
        text-transform: none;
        margin: 0;
        
        ion-icon {
          font-size: 20px;
          margin-right: 8px;
        }
      }
    }

    .close-form {
      .form-actions {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        margin-top: 24px;

        ion-button {
          --border-radius: 8px;
          --padding-top: 12px;
          --padding-bottom: 12px;
          font-weight: 600;
          text-transform: none;

          &[disabled] {
            --opacity: 0.5;
          }
        }
      }

      ion-item {
        --background: var(--ion-color-light);
        --border-radius: 8px;
        --border-width: 1px;
        --border-color: var(--ion-color-medium);
        --padding-start: 12px;
        --padding-end: 12px;
        --min-height: 56px;
        margin-bottom: 16px;

        &.item-has-focus {
          --border-color: var(--ion-color-primary);
          --border-width: 2px;
        }

        ion-label {
          font-weight: 500;
          color: var(--ion-color-dark);
          
          .auto-calculated {
            font-size: 12px;
            color: var(--ion-color-success);
            font-weight: 400;
            font-style: italic;
          }
        }

        ion-input,
        ion-datetime {
          --color: var(--ion-color-dark);
        }
      }
    }

    .withdraw-form {
      .form-actions {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        margin-top: 24px;

        ion-button {
          --border-radius: 8px;
          --padding-top: 12px;
          --padding-bottom: 12px;
          font-weight: 600;
          text-transform: none;

          &[disabled] {
            --opacity: 0.5;
          }
        }
      }

      ion-item {
        --background: var(--ion-color-light);
        --border-radius: 8px;
        --border-width: 1px;
        --border-color: var(--ion-color-medium);
        --padding-start: 12px;
        --padding-end: 12px;
        --min-height: 56px;
        margin-bottom: 16px;

        &.item-has-focus {
          --border-color: var(--ion-color-primary);
          --border-width: 2px;
        }

        ion-label {
          font-weight: 500;
          color: var(--ion-color-dark);
        }

        ion-input,
        ion-datetime {
          --color: var(--ion-color-dark);
        }
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--ion-color-light);
      border-radius: 8px;
      
      ion-icon {
        font-size: 20px;
        color: var(--ion-color-primary);
      }
      
      .info-content {
        display: flex;
        flex-direction: column;
        
        .info-label {
          font-size: 12px;
          color: var(--ion-color-medium);
          font-weight: 500;
        }
        
        .info-value {
          font-size: 14px;
          color: var(--ion-color-dark);
          font-weight: 600;
        }
      }
      
      .status-badge {
        margin-left: auto;
      }
    }

    .no-data {
      text-align: center;
      padding: 32px 16px;
      color: var(--ion-color-medium);
      
      ion-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }
      
      p {
        margin: 0;
        font-size: 16px;
      }
    }

    .items-list {
      .item-card {
        margin-bottom: 8px;
        border-radius: 8px;
        --background: var(--ion-color-light);
        
        ion-icon {
          font-size: 24px;
        }
        
        ion-label {
          h3 {
            font-weight: 600;
            color: var(--ion-color-dark);
            margin-bottom: 4px;
          }
          
          p {
            margin: 2px 0;
            font-size: 14px;
            color: var(--ion-color-medium);
            
            strong {
              color: var(--ion-color-primary);
            }
          }
        }
      }
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 16px;
      background: var(--ion-color-light);
      border-radius: 8px;
      
      ion-icon {
        font-size: 24px;
        margin-bottom: 8px;
      }
      
      .summary-number {
        font-size: 24px;
        font-weight: 700;
        color: var(--ion-color-dark);
        margin-bottom: 4px;
      }
      
      .summary-label {
        font-size: 12px;
        color: var(--ion-color-medium);
        font-weight: 500;
      }
    }

    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .summary-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `]
})
export class OSDetailsModalComponent implements OnInit {
  @Input() ordemServico!: OrdemServico;
  @Input() pecasUtilizadas: PecaUtilizada[] = [];
  @Input() servicosRealizados: ServicoRealizado[] = [];
  @Input() loading: boolean = false;

  // Form properties
  showCloseForm = false;
  closeOSForm!: FormGroup;
  showWithdrawForm = false;
  withdrawVehicleForm!: FormGroup;
  environment = environment;
  loadingCompleteData = false;

  constructor(
    private modalController: ModalController,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    this.initializeCloseForm();
    this.initializeWithdrawForm();
  }

  async ngOnInit() {
    // Load complete OS data including withdrawal information
    await this.loadCompleteOSData();
  }

  /**
   * Load complete OS data from backend
   */
  async loadCompleteOSData() {
    if (!this.ordemServico?.id) return;

    this.loadingCompleteData = true;
    
    try {
      const token = localStorage.getItem(environment.storage.token);
      const options: any = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response: any = await this.http.get(
        `${environment.apiUrl}${environment.endpoints.ordensServico}/${this.ordemServico.id}`,
        options
      ).toPromise();
      
      console.log('Complete OS Response:', response);
      
      if (response && (response.status === 'success' || response.success) && response.data) {
        // Update the OS data with complete information
        this.ordemServico = response.data;
      }
    } catch (error: any) {
      console.error('Error loading complete OS data:', error);
    } finally {
      this.loadingCompleteData = false;
    }
  }

  /**
   * Initialize the close OS form
   */
  initializeCloseForm() {
    this.closeOSForm = this.formBuilder.group({
      nome_mecanico: ['', [Validators.required, Validators.minLength(2)]],
      data_da_manutencao: ['', Validators.required],
      tempo_total: ['00:00', [Validators.required, Validators.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
      modelo_veiculo: ['']
    });
  }

  /**
   * Initialize the withdraw vehicle form
   */
  initializeWithdrawForm() {
    this.withdrawVehicleForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      data: ['', Validators.required]
    });
  }

  /**
   * Show close OS form
   */
  showCloseOSForm() {
    this.showCloseForm = true;
    
    // Calculate total time from services
    const totalTime = this.calculateTotalServiceTime();
    
    // Auto-fill modelo_veiculo and tempo_total
    const formData: any = {};
    
    if (this.ordemServico?.veiculo?.modelo) {
      formData.modelo_veiculo = this.ordemServico.veiculo.modelo;
    }
    
    if (totalTime) {
      formData.tempo_total = totalTime;
    }
    
    this.closeOSForm.patchValue(formData);
  }

  /**
   * Hide close OS form
   */
  hideCloseOSForm() {
    this.showCloseForm = false;
    this.closeOSForm.reset({
      tempo_total: '00:00'
    });
  }

  /**
   * Calculate total time from all services
   */
  calculateTotalServiceTime(): string {
    if (!this.servicosRealizados || this.servicosRealizados.length === 0) {
      return '00:00';
    }
    
    let totalMinutes = 0;
    
    this.servicosRealizados.forEach(servico => {
      const time = servico.tempo_de_servico_realizado;
      if (time && time.includes(':')) {
        const [hours, minutes] = time.split(':').map(Number);
        totalMinutes += (hours * 60) + minutes;
      }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Show withdraw vehicle form
   */
  showWithdrawVehicleForm() {
    this.showWithdrawForm = true;
  }

  /**
   * Hide withdraw vehicle form
   */
  hideWithdrawVehicleForm() {
    this.showWithdrawForm = false;
    this.withdrawVehicleForm.reset();
  }

  /**
   * Close OS
   */
  async closeOS() {
    if (this.closeOSForm.invalid) {
      await this.showErrorToast('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Fechando OS...'
    });
    await loading.present();

    let formData: any;
    try {
      const token = localStorage.getItem(environment.storage.token);
      const options: any = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
      
      formData = {
        ...this.closeOSForm.value,
        situacao_os: 'FECHADA',
        abrir_os_id: this.ordemServico.id
      };
      
      const response: any = await this.http.post(
        `${environment.apiUrl}${environment.endpoints.encerrarOS}/`,
        formData,
        options
      ).toPromise();
      
      console.log('Close OS Response:', response);
      
      if (response && (response.status === 'success' || response.success)) {
        await this.showSuccessToast(response.message || 'OS fechada com sucesso!');
        this.hideCloseOSForm();
        // Update the OS status in the modal
        this.ordemServico.situacao_os = 'FECHADA';
        // Dismiss modal to refresh the list
        this.modalController.dismiss({ osClosed: true });
      } else {
        throw new Error(response?.message || 'Erro ao fechar OS');
      }
    } catch (error: any) {
      console.error('Error closing OS:', error);
      console.error('Error response:', error.error);
      console.error('Form data sent:', formData || 'Not available');
      
      let errorMessage = 'Erro ao fechar OS';
      
      if (error.error && error.error.detail) {
        if (Array.isArray(error.error.detail)) {
          errorMessage = error.error.detail.map((d: any) => d.msg || d.message || d).join(', ');
        } else {
          errorMessage = error.error.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      await this.showErrorToast(errorMessage);
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Withdraw vehicle
   */
  async withdrawVehicle() {
    if (this.withdrawVehicleForm.invalid) {
      await this.showErrorToast('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Retirando veículo...'
    });
    await loading.present();

    let formData: any;
    try {
      const token = localStorage.getItem(environment.storage.token);
      const options: any = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
      
      formData = {
        ...this.withdrawVehicleForm.value,
        encerrar_os_id: this.ordemServico.encerrar_os?.id || this.ordemServico.id
      };
      
      const response: any = await this.http.post(
        `${environment.apiUrl}${environment.endpoints.retiradaViatura}/`,
        formData,
        options
      ).toPromise();
      
      console.log('Withdraw Vehicle Response:', response);
      
      if (response && (response.status === 'success' || response.success)) {
        await this.showSuccessToast(response.message || 'Veículo retirado com sucesso!');
        this.hideWithdrawVehicleForm();
        // Update the OS status in the modal
        this.ordemServico.situacao_os = 'RETIRADA';
        // Dismiss modal to refresh the list
        this.modalController.dismiss({ vehicleWithdrawn: true });
      } else {
        throw new Error(response?.message || 'Erro ao retirar veículo');
      }
    } catch (error: any) {
      console.error('Error withdrawing vehicle:', error);
      console.error('Error response:', error.error);
      console.error('Form data sent:', formData || 'Not available');
      
      let errorMessage = 'Erro ao retirar veículo';
      
      if (error.error && error.error.detail) {
        if (Array.isArray(error.error.detail)) {
          errorMessage = error.error.detail.map((d: any) => d.msg || d.message || d).join(', ');
        } else {
          errorMessage = error.error.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      await this.showErrorToast(errorMessage);
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Show success toast
   */
  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: environment.toast.duration.success,
      position: environment.toast.position as 'top' | 'bottom' | 'middle',
      color: 'success'
    });
    await toast.present();
  }

  /**
   * Show error toast
   */
  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: environment.toast.duration.error,
      position: environment.toast.position as 'top' | 'bottom' | 'middle',
      color: 'danger'
    });
    await toast.present();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  /**
   * Export OS information to PDF
   */
  async exportToPDF() {
    try {
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        await this.showErrorToast('Não foi possível abrir a janela de impressão');
        return;
      }

      // Generate HTML content for PDF
      const htmlContent = this.generatePDFContent();
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
      
      await this.showSuccessToast('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      await this.showErrorToast('Erro ao gerar PDF');
    }
  }

  /**
   * Generate HTML content for PDF
   */
  private generatePDFContent(): string {
    const os = this.ordemServico;
    const retirada = os.retirada_viatura;
    const encerramento = os.encerrar_os;
    
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const currentTime = new Date().toLocaleTimeString('pt-BR');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Ordem de Serviço - OS #${os.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 28px;
          }
          .header h2 {
            color: #666;
            margin: 5px 0;
            font-size: 18px;
            font-weight: normal;
          }
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .section-title {
            background-color: #f8f9fa;
            color: #007bff;
            padding: 10px 15px;
            font-weight: bold;
            font-size: 16px;
            border-left: 4px solid #007bff;
            margin-bottom: 15px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          .info-item {
            border: 1px solid #dee2e6;
            padding: 10px;
            border-radius: 5px;
          }
          .info-label {
            font-weight: bold;
            color: #495057;
            font-size: 12px;
            text-transform: uppercase;
          }
          .info-value {
            color: #212529;
            font-size: 14px;
            margin-top: 5px;
          }
          .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 15px;
            color: white;
            font-weight: bold;
            font-size: 12px;
          }
          .status-retirada {
            background-color: #28a745;
          }
          .items-list {
            margin-top: 15px;
          }
          .item {
            border: 1px solid #dee2e6;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 5px;
            background-color: #f8f9fa;
          }
          .item-title {
            font-weight: bold;
            color: #007bff;
            margin-bottom: 8px;
          }
          .item-details {
            font-size: 13px;
            color: #6c757d;
          }
          .summary {
            background-color: #e9ecef;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
          }
          .summary-item {
            display: inline-block;
            margin: 0 20px;
            text-align: center;
          }
          .summary-number {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            display: block;
          }
          .summary-label {
            font-size: 12px;
            color: #6c757d;
            text-transform: uppercase;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
            padding-top: 20px;
          }
          @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RELATÓRIO DE ORDEM DE SERVIÇO</h1>
          <h2>OS #${os.id} - ${os.veiculo?.marca} ${os.veiculo?.modelo} (${os.veiculo?.placa})</h2>
          <p>Status: <span class="status-badge status-retirada">RETIRADA</span></p>
        </div>

        <div class="section">
          <div class="section-title">📋 Informações da Ordem de Serviço</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Veículo</div>
              <div class="info-value">${os.veiculo?.marca} ${os.veiculo?.modelo} (${os.veiculo?.placa})</div>
            </div>
            <div class="info-item">
              <div class="info-label">Patrimônio</div>
              <div class="info-value">${os.veiculo?.patrimonio || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Data de Abertura</div>
              <div class="info-value">${this.formatDate(os.created_at)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Hodômetro</div>
              <div class="info-value">${os.hodometro} km</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tipo de Manutenção</div>
              <div class="info-value">${this.getMaintenanceDisplayName(os.manutencao)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value"><span class="status-badge status-retirada">RETIRADA</span></div>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">Problema Apresentado</div>
            <div class="info-value">${os.problema_apresentado}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Sistema Afetado</div>
            <div class="info-value">${os.sistema_afetado}</div>
          </div>
          ${os.causa_da_avaria ? `
          <div class="info-item">
            <div class="info-label">Causa da Avaria</div>
            <div class="info-value">${os.causa_da_avaria}</div>
          </div>
          ` : ''}
        </div>

        ${encerramento ? `
        <div class="section">
          <div class="section-title">🔧 Informações do Encerramento</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Mecânico Responsável</div>
              <div class="info-value">${encerramento.nome_mecanico}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Data da Manutenção</div>
              <div class="info-value">${this.formatDate(encerramento.data_da_manutencao)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tempo Total</div>
              <div class="info-value">${encerramento.tempo_total}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Data do Encerramento</div>
              <div class="info-value">${this.formatDate(encerramento.created_at)}</div>
            </div>
          </div>
        </div>
        ` : ''}

        ${retirada ? `
        <div class="section">
          <div class="section-title">🚗 Informações da Retirada</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Responsável pela Retirada</div>
              <div class="info-value">${retirada.nome}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Data da Retirada</div>
              <div class="info-value">${this.formatDate(retirada.data)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Registrado por</div>
              <div class="info-value">${retirada.usuario?.nome_completo || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Data do Registro</div>
              <div class="info-value">${this.formatDate(retirada.created_at)}</div>
            </div>
          </div>
        </div>
        ` : ''}

        ${this.pecasUtilizadas.length > 0 ? `
        <div class="section">
          <div class="section-title">🔩 Peças Utilizadas (${this.pecasUtilizadas.length})</div>
          <div class="items-list">
            ${this.pecasUtilizadas.map(peca => `
              <div class="item">
                <div class="item-title">${peca.peca_utilizada}</div>
                <div class="item-details">
                  <strong>Ficha:</strong> ${peca.num_ficha} | 
                  <strong>Quantidade:</strong> ${peca.qtd} | 
                  <strong>Cadastrado por:</strong> ${peca.usuario?.nome_completo || 'N/A'} | 
                  <strong>Data:</strong> ${this.formatDate(peca.created_at)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        ${this.servicosRealizados.length > 0 ? `
        <div class="section">
          <div class="section-title">⚙️ Serviços Realizados (${this.servicosRealizados.length})</div>
          <div class="items-list">
            ${this.servicosRealizados.map(servico => `
              <div class="item">
                <div class="item-title">${servico.servico_realizado}</div>
                <div class="item-details">
                  <strong>Tempo:</strong> ${servico.tempo_de_servico_realizado} | 
                  <strong>Realizado por:</strong> ${servico.usuario?.nome_completo || 'N/A'} | 
                  <strong>Data:</strong> ${this.formatDate(servico.created_at)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">📊 Resumo</div>
          <div class="summary">
            <div class="summary-item">
              <span class="summary-number">${this.pecasUtilizadas.length}</span>
              <span class="summary-label">Peças</span>
            </div>
            <div class="summary-item">
              <span class="summary-number">${this.servicosRealizados.length}</span>
              <span class="summary-label">Serviços</span>
            </div>
            <div class="summary-item">
              <span class="summary-number">${this.getTotalTime()}</span>
              <span class="summary-label">Tempo Total</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Relatório gerado em ${currentDate} às ${currentTime}</p>
          <p>Sistema de Gestão de Ordens de Serviço (SGOS)</p>
        </div>
      </body>
      </html>
    `;
  }

  getVeiculoDisplayName(): string {
    if (!this.ordemServico?.veiculo) return 'Veículo não encontrado';
    return `${this.ordemServico.veiculo.marca} ${this.ordemServico.veiculo.modelo} (${this.ordemServico.veiculo.placa})`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ABERTA':
        return 'warning';
      case 'FECHADA':
        return 'success';
      case 'RETIRADA':
        return 'primary';
      default:
        return 'medium';
    }
  }

  getStatusDisplayName(status: string): string {
    switch (status) {
      case 'ABERTA':
        return 'Aberta';
      case 'FECHADA':
        return 'Fechada';
      case 'RETIRADA':
        return 'Retirada';
      default:
        return status;
    }
  }

  getMaintenanceDisplayName(type: string): string {
    switch (type) {
      case 'PREVENTIVA':
        return 'Preventiva';
      case 'CORRETIVA':
        return 'Corretiva';
      default:
        return type;
    }
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  }

  getTotalTime(): string {
    if (this.servicosRealizados.length === 0) return '0h 00m';
    
    let totalMinutes = 0;
    
    this.servicosRealizados.forEach(servico => {
      const time = servico.tempo_de_servico_realizado;
      if (time && time.includes(':')) {
        const [hours, minutes] = time.split(':').map(Number);
        totalMinutes += (hours * 60) + minutes;
      }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
}
