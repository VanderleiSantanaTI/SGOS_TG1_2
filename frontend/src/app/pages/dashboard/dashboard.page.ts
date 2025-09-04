import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy {
  currentUser: any = null;
  loading = false;
  private authSubscriptions: Subscription[] = [];

  stats = {
    ordensServico: { total: 0, abertas: 0, fechadas: 0, retiradas: 0 },
    veiculos: { total: 0, ativos: 0, manutencao: 0 },
    usuarios: { total: 0, ativos: 0 }
  };

  constructor(
    private router: Router,
    private menuController: MenuController,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.setupAuthSubscriptions();
    this.loadStats();
  }

  ngOnDestroy() {
    this.authSubscriptions.forEach(sub => sub.unsubscribe());
  }

  setupAuthSubscriptions() {
    // Subscribe to current user changes
    const userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.authSubscriptions.push(userSub);
  }

  private async loadStats() {
    this.loading = true;
    try {
      const token = this.authService.getToken();
      const options: any = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }

      const [osResp, veiculosResp, usuariosResp]: any[] = await Promise.all([
        this.http.get('http://localhost:8000/api/v1/ordens-servico/?limit=1000', options).toPromise(),
        this.http.get('http://localhost:8000/api/v1/veiculos/?limit=1000', options).toPromise(),
        this.http.get('http://localhost:8000/api/v1/usuarios/?limit=1000', options).toPromise()
      ]);

      const osItems = osResp?.data?.items || [];
      const veiculosItems = veiculosResp?.data?.items || [];
      const usuariosItems = usuariosResp?.data?.items || [];
      
      
      const osTotal = osItems.length;
      const osAbertas = osItems.filter((o: any) => o.situacao_os === 'ABERTA').length;
      const osFechadas = osItems.filter((o: any) => o.situacao_os === 'FECHADA').length;
      const osRetiradas = osItems.filter((o: any) => o.situacao_os === 'RETIRADA').length;

      const veiculosTotal = veiculosItems.length;
      const veiculosAtivos = veiculosItems.filter((v: any) => v.status === 'ATIVO').length;
      const veiculosManutencao = veiculosItems.filter((v: any) => v.status === 'MANUTENCAO').length;

      const usuariosTotal = usuariosItems.length;
      const usuariosAtivos = usuariosItems.filter((u: any) => u.ativo === true).length;

      this.stats = {
        ordensServico: { total: osTotal, abertas: osAbertas, fechadas: osFechadas, retiradas: osRetiradas },
        veiculos: { total: veiculosTotal, ativos: veiculosAtivos, manutencao: veiculosManutencao },
        usuarios: { total: usuariosTotal, ativos: usuariosAtivos }
      };
    } catch (error) {
      console.error('Erro ao carregar estatísticas do dashboard:', error);
      this.stats = {
        ordensServico: { total: 0, abertas: 0, fechadas: 0, retiradas: 0 },
        veiculos: { total: 0, ativos: 0, manutencao: 0 },
        usuarios: { total: 0, ativos: 0 }
      };
    } finally {
      this.loading = false;
    }
  }
  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  getUserFirstName(): string {
    if (!this.currentUser?.nome_completo) return 'Usuário';
    return this.currentUser.nome_completo.split(' ')[0];
  }

  getGreetingMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  createNewOS() {
    this.router.navigate(['/ordens-servico']);
  }
}