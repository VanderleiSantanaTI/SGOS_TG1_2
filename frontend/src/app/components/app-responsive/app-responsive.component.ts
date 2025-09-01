import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, Platform } from '@ionic/angular';

interface MenuItem {
  title: string;
  url: string;
  icon: string;
  requiredRole?: string;
}

@Component({
  selector: 'app-responsive',
  templateUrl: './app-responsive.component.html',
  styleUrls: ['./app-responsive.component.scss'],
})
export class AppResponsiveComponent implements OnInit {
  currentUser: any = null;
  isAuthenticated = false;
  isMobile = false;
  isTablet = false;
  isDesktop = false;

  mainMenuItems: MenuItem[] = [
    { title: 'Dashboard', url: '/dashboard', icon: 'home-outline' },
    { title: 'Ordens de Serviço', url: '/ordens-servico', icon: 'construct-outline' },
    { title: 'Veículos', url: '/veiculos', icon: 'car-outline' },
    { title: 'Usuários', url: '/usuarios', icon: 'people-outline', requiredRole: 'SUPERVISOR' },
    { title: 'Relatórios', url: '/relatorios', icon: 'bar-chart-outline', requiredRole: 'SUPERVISOR' },
    { title: 'Configurações', url: '/configuracoes', icon: 'settings-outline', requiredRole: 'ADMIN' }
  ];

  userMenuItems: MenuItem[] = [
    { title: 'Perfil', url: '/perfil', icon: 'person-outline' }
  ];

  constructor(
    private router: Router,
    private menuController: MenuController,
    private platform: Platform
  ) {}

  ngOnInit() {
    // Check authentication
    this.checkAuthentication();
    
    // Set up responsive breakpoints
    this.updateScreenSize();
    
    // Listen for screen size changes
    this.platform.resize.subscribe(() => {
      this.updateScreenSize();
    });
  }

  /**
   * Check if user is authenticated
   */
  checkAuthentication() {
    const token = localStorage.getItem('sgos_token');
    const userStr = localStorage.getItem('sgos_user');
    
    if (token && userStr) {
      this.currentUser = JSON.parse(userStr);
      this.isAuthenticated = true;
    } else {
      this.isAuthenticated = false;
      this.currentUser = null;
    }
  }

  /**
   * Update screen size flags
   */
  updateScreenSize() {
    const width = this.platform.width();
    
    this.isMobile = width < 768;
    this.isTablet = width >= 768 && width < 1024;
    this.isDesktop = width >= 1024;
  }

  /**
   * Check if user has permission for menu item
   */
  hasPermission(item: MenuItem): boolean {
    if (!item.requiredRole) return true;
    if (!this.currentUser) return false;
    
    const roleHierarchy: { [key: string]: number } = {
      'ADMIN': 4,
      'SUPERVISOR': 3,
      'MECANICO': 2,
      'USUARIO': 1
    };

    const userLevel = roleHierarchy[this.currentUser.perfil as string] || 0;
    const requiredLevel = roleHierarchy[item.requiredRole] || 0;

    return userLevel >= requiredLevel;
  }

  /**
   * Get filtered menu items
   */
  getFilteredMenuItems(): MenuItem[] {
    return this.mainMenuItems.filter(item => this.hasPermission(item));
  }

  /**
   * Navigate to page
   */
  async navigateTo(url: string) {
    await this.router.navigate([url]);
    
    // Close mobile menu if open
    if (this.isMobile) {
      await this.menuController.close();
    }
  }

  /**
   * Toggle mobile menu
   */
  async toggleMobileMenu() {
    await this.menuController.toggle();
  }

  /**
   * Logout user
   */
  async logout() {
    localStorage.removeItem('sgos_token');
    localStorage.removeItem('sgos_user');
    this.currentUser = null;
    this.isAuthenticated = false;
    await this.menuController.close();
    await this.router.navigate(['/login']);
  }

  /**
   * Get user initials for avatar
   */
  getUserInitials(): string {
    if (!this.currentUser?.nome_completo) return 'U';
    const names = this.currentUser.nome_completo.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  /**
   * Get user role display name
   */
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

  /**
   * Get current route for highlighting
   */
  isCurrentRoute(url: string): boolean {
    return this.router.url === url;
  }

  /**
   * Get user first name
   */
  getUserFirstName(): string {
    if (!this.currentUser?.nome_completo) return 'Usuário';
    return this.currentUser.nome_completo.split(' ')[0];
  }
}
