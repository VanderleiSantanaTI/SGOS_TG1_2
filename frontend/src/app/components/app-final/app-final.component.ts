import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-final',
  templateUrl: './app-final.component.html',
  styleUrls: ['./app-final.component.scss'],
})
export class AppFinalComponent implements OnInit {
  currentUser: any = null;
  isAuthenticated = false;
  isMobile = true;
  screenWidth = 0;

  menuItems = [
    { title: 'Dashboard', url: '/dashboard', icon: 'home-outline' },
    { title: 'Ordens de Serviço', url: '/ordens-servico', icon: 'construct-outline' },
    { title: 'Veículos', url: '/veiculos', icon: 'car-outline' },
    { title: 'Usuários', url: '/usuarios', icon: 'people-outline', role: 'SUPERVISOR' },
    { title: 'Relatórios', url: '/relatorios', icon: 'bar-chart-outline', role: 'SUPERVISOR' },
    { title: 'Configurações', url: '/configuracoes', icon: 'settings-outline', role: 'ADMIN' }
  ];

  constructor(
    private router: Router,
    private menuController: MenuController,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.checkAuth();
    this.updateScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateScreenSize();
  }

  updateScreenSize() {
    this.screenWidth = window.innerWidth;
    this.isMobile = this.screenWidth < 768;
  }

  checkAuth() {
    const token = localStorage.getItem('sgos_token');
    const userStr = localStorage.getItem('sgos_user');
    
    if (token && userStr) {
      this.currentUser = JSON.parse(userStr);
      this.isAuthenticated = true;
    }
  }

  hasPermission(item: any): boolean {
    if (!item.role) return true;
    if (!this.currentUser) return false;
    
    const roles: { [key: string]: number } = { 'ADMIN': 4, 'SUPERVISOR': 3, 'MECANICO': 2, 'USUARIO': 1 };
    const userLevel = roles[this.currentUser.perfil as string] || 0;
    const requiredLevel = roles[item.role] || 0;
    
    return userLevel >= requiredLevel;
  }

  getFilteredMenuItems() {
    return this.menuItems.filter(item => this.hasPermission(item));
  }

  async navigateTo(url: string) {
    await this.router.navigate([url]);
    if (this.isMobile) {
      await this.menuController.close();
    }
  }

  async logout() {
    localStorage.clear();
    this.currentUser = null;
    this.isAuthenticated = false;
    await this.menuController.close();
    await this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    if (!this.currentUser?.nome_completo) return 'U';
    const names = this.currentUser.nome_completo.split(' ');
    return names.length >= 2 ? 
      (names[0][0] + names[1][0]).toUpperCase() : 
      names[0][0].toUpperCase();
  }

  getUserFirstName(): string {
    if (!this.currentUser?.nome_completo) return 'Usuário';
    return this.currentUser.nome_completo.split(' ')[0];
  }

  getRoleDisplayName(): string {
    if (!this.currentUser) return '';
    const roleNames: { [key: string]: string } = {
      'ADMIN': 'Admin', 'SUPERVISOR': 'Supervisor', 
      'MECANICO': 'Mecânico', 'USUARIO': 'Usuário'
    };
    return roleNames[this.currentUser.perfil as string] || this.currentUser.perfil;
  }

  isCurrentRoute(url: string): boolean {
    return this.router.url === url;
  }
}
