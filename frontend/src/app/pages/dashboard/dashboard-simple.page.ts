import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { OrdemServicoService } from '../../services/ordem-servico.service';
import { VeiculoService } from '../../services/veiculo.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard-simple.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  currentUser: any = null;
  loading = false;

  // Estatísticas carregadas da API
  osStats = { total: 0, abertas: 0, fechadas: 0, retiradas: 0 };
  veiculoStats = { total: 0, ativos: 0, manutencao: 0 };
  usuarioStats = { total: 0, ativos: 0 };

  constructor(
    private router: Router,
    private menuController: MenuController,
    private ordemServicoService: OrdemServicoService,
    private veiculoService: VeiculoService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    // Get user from localStorage
    const userStr = localStorage.getItem('sgos_user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }

    this.loadStats();
  }

  private loadStats() {
    this.loading = true;

    // OS stats
    this.ordemServicoService.getOSStats()
      .pipe(
        catchError(() => of({ total: 0, abertas: 0, fechadas: 0, retiradas: 0, porTipo: {}, porMes: {} })),
        finalize(() => (this.loading = false))
      )
      .subscribe(stats => {
        this.osStats = {
          total: stats.total,
          abertas: stats.abertas,
          fechadas: stats.fechadas,
          retiradas: stats.retiradas
        };
      });

    // Veículos stats
    this.veiculoService.getVeiculoStats()
      .pipe(catchError(() => of({ total: 0, ativos: 0, manutencao: 0, inativos: 0, porMarca: {}, porCia: {} })))
      .subscribe(stats => {
      this.veiculoStats = {
        total: stats.total,
        ativos: stats.ativos,
        manutencao: stats.manutencao
      };
    });

    // Usuários stats
    this.usuarioService.getUserStats()
      .pipe(catchError(() => of({ total: 0, ativos: 0, inativos: 0, porPerfil: {} })))
      .subscribe(stats => {
      this.usuarioStats = {
        total: stats.total,
        ativos: stats.ativos
      };
    });
  }

  async openMenu() {
    await this.menuController.open();
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

  async logout() {
    localStorage.removeItem('sgos_token');
    localStorage.removeItem('sgos_user');
    await this.router.navigate(['/login']);
  }
}
