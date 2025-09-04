export const environment = {
  production: true,
  
  // API Configuration
  apiUrl: 'https://api.sgos.com/api/v1',
  apiTimeout: 30000, // 30 segundos
  
  // App Configuration
  appName: 'SGOS - Sistema de Gerenciamento de Ordem de Serviço',
  version: '1.0.0',
  
  // API Endpoints
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password'
    },
    usuarios: '/usuarios',
    veiculos: '/veiculos',
    ordensServico: '/ordens-servico',
    pecasUtilizadas: '/pecas-utilizadas',
    servicosRealizados: '/servicos-realizados',
    encerrarOS: '/encerrar-os',
    retiradaViatura: '/retirada-viatura'
  },
  
  // Pagination
  pagination: {
    defaultPageSize: 100,
    maxPageSize: 1000
  },
  
  // Storage Keys
  storage: {
    token: 'sgos_token',
    user: 'sgos_user'
  },
  
  // Toast Configuration
  toast: {
    duration: {
      success: 2000,
      error: 3000,
      warning: 2500
    },
    position: 'top'
  },
  
  // Search Configuration
  search: {
    debounceTime: 300,
    minSearchLength: 2
  }
};
