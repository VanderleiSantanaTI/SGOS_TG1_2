import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },
  {
    path: 'ordens-servico',
    loadChildren: () => import('./pages/ordens-servico/ordens-servico.module').then(m => m.OrdensServicoPageModule)
  },
  {
    path: 'veiculos',
    loadChildren: () => import('./pages/veiculos/veiculos.module').then(m => m.VeiculosPageModule)
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./pages/usuarios/usuarios.module').then(m => m.UsuariosPageModule)
  },
  {
    path: 'relatorios',
    loadChildren: () => import('./pages/relatorios/relatorios.module').then(m => m.RelatoriosPageModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then(m => m.PerfilPageModule)
  },
  {
    path: 'configuracoes',
    loadChildren: () => import('./pages/configuracoes/configuracoes.module').then(m => m.ConfiguracoesPageModule)
  },
  {
    path: 'pecas-servicos',
    loadChildren: () => import('./pages/pecas-servicos/pecas-servicos.module').then(m => m.PecasServicosPageModule)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { 
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
