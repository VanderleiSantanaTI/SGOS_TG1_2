import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

interface DashboardStats {
  ordensServico: {
    total: number;
    abertas: number;
    fechadas: number;
    retiradas: number;
  };
  veiculos: {
    total: number;
    ativos: number;
    manutencao: number;
  };
  usuarios: {
    total: number;
    ativos: number;
  };
}

@Component({
  selector: 'app-dashboard-stats',
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.scss'],
})
export class DashboardStatsComponent implements OnInit {
  @Input() stats: DashboardStats = {
    ordensServico: { total: 0, abertas: 0, fechadas: 0, retiradas: 0 },
    veiculos: { total: 0, ativos: 0, manutencao: 0 },
    usuarios: { total: 0, ativos: 0 }
  };
  
  @Input() loading = false;
  @Input() currentUser: any = null;

  constructor(private router: Router) {}

  ngOnInit() {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  hasPermission(role: string): boolean {
    if (!this.currentUser) return false;
    
    const roles: { [key: string]: number } = { 'ADMIN': 4, 'SUPERVISOR': 3, 'MECANICO': 2, 'USUARIO': 1 };
    const userLevel = roles[this.currentUser.perfil as string] || 0;
    const requiredLevel = roles[role] || 0;
    
    return userLevel >= requiredLevel;
  }
}
