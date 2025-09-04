import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  isAuthenticated = false;
  isMobile = true;
  screenWidth = 0;
  private authSubscriptions: Subscription[] = [];

  menuItems = [
    { title: 'Dashboard', url: '/dashboard', icon: 'home-outline' },
    { title: 'Ordens de Serviço', url: '/ordens-servico', icon: 'construct-outline' },
    { title: 'Peças e Serviços', url: '/pecas-servicos', icon: 'hardware-chip-outline', role: 'MECANICO' },
    { title: 'Veículos', url: '/veiculos', icon: 'car-outline' },
    { title: 'Usuários', url: '/usuarios', icon: 'people-outline', role: 'SUPERVISOR' },
    { title: 'Relatórios', url: '/relatorios', icon: 'bar-chart-outline', role: 'SUPERVISOR' }
  ];

  constructor(
    private router: Router,
    private menuController: MenuController,
    private platform: Platform,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.updateScreenSize();
    this.setupAuthSubscriptions();
    
    // Force initial check of auth state
    this.checkInitialAuthState();
  }

  private checkInitialAuthState() {
    // Check if user is already authenticated
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnDestroy() {
    this.authSubscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateScreenSize();
  }

  updateScreenSize() {
    this.screenWidth = window.innerWidth;
    this.isMobile = this.screenWidth < 768;
  }

  setupAuthSubscriptions() {
    // Subscribe to authentication state changes
    const authSub = this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
    
    // Subscribe to current user changes
    const userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.authSubscriptions.push(authSub, userSub);
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
    await this.authService.logout();
    await this.menuController.close();
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
