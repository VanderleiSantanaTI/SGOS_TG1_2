import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-simple',
  templateUrl: './app-simple.component.html',
  styleUrls: ['./app-simple.component.scss'],
})
export class AppSimpleComponent implements OnInit {
  currentUser: any = null;
  isAuthenticated = false;

  menuItems = [
    { title: 'Dashboard', url: '/dashboard', icon: 'home-outline' },
    { title: 'Ordens de Serviço', url: '/ordens-servico', icon: 'construct-outline' },
    { title: 'Veículos', url: '/veiculos', icon: 'car-outline' },
    { title: 'Usuários', url: '/usuarios', icon: 'people-outline' },
    { title: 'Relatórios', url: '/relatorios', icon: 'bar-chart-outline' },
    { title: 'Configurações', url: '/configuracoes', icon: 'settings-outline' }
  ];

  constructor(
    private router: Router,
    private menuController: MenuController
  ) {}

  ngOnInit() {
    // Check if user is logged in
    const token = localStorage.getItem('sgos_token');
    const userStr = localStorage.getItem('sgos_user');
    
    if (token && userStr) {
      this.currentUser = JSON.parse(userStr);
      this.isAuthenticated = true;
    }
  }

  async navigateTo(url: string) {
    await this.router.navigate([url]);
    await this.menuController.close();
  }

  async logout() {
    localStorage.removeItem('sgos_token');
    localStorage.removeItem('sgos_user');
    this.currentUser = null;
    this.isAuthenticated = false;
    await this.menuController.close();
    await this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    if (!this.currentUser?.nome_completo) return 'U';
    const names = this.currentUser.nome_completo.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  getUserRoleDisplayName(): string {
    if (!this.currentUser) return '';
    const roleNames: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'SUPERVISOR': 'Supervisor',
      'MECANICO': 'Mecânico',
      'USUARIO': 'Usuário'
    };
    return roleNames[this.currentUser.perfil as string] || this.currentUser.perfil;
  }
}
