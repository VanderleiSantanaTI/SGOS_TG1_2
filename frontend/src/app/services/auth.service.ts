import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

import { ApiService } from './api.service';
import { 
  Usuario, 
  LoginRequest, 
  LoginResponse, 
  PasswordResetRequest, 
  ApiResponse 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  private readonly TOKEN_KEY = 'sgos_token';
  private readonly USER_KEY = 'sgos_user';

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private router: Router,
    private storage: Storage
  ) {
    this.initStorage();
  }

  private async initStorage() {
    try {
      await this.storage.create();
      await this.loadStoredAuth();
    } catch (error) {
      console.error('Error initializing storage:', error);
      // Fallback to localStorage only
      this.loadStoredAuthFromLocalStorage();
    }
  }

  private loadStoredAuthFromLocalStorage() {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userStr = localStorage.getItem(this.USER_KEY);
      const userData = userStr ? JSON.parse(userStr) : null;

      if (token && userData) {
        this.tokenSubject.next(token);
        this.currentUserSubject.next(userData);
        this.isAuthenticatedSubject.next(true);
      }
    } catch (error) {
      console.error('Error loading auth from localStorage:', error);
    }
  }

  /**
   * Load authentication data from storage
   */
  private async loadStoredAuth() {
    try {
      // Try Ionic Storage first, fallback to localStorage
      let token = await this.storage.get(this.TOKEN_KEY);
      let userData = await this.storage.get(this.USER_KEY);
      
      // Fallback to localStorage if Ionic Storage is empty
      if (!token) {
        token = localStorage.getItem(this.TOKEN_KEY);
      }
      if (!userData) {
        const userStr = localStorage.getItem(this.USER_KEY);
        userData = userStr ? JSON.parse(userStr) : null;
      }

      if (token && userData) {
        this.tokenSubject.next(token);
        this.currentUserSubject.next(userData);
        this.isAuthenticatedSubject.next(true);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    }
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', credentials)
      .pipe(
        tap(async (response) => {
          if ((response.status === 'success' || response.success) && response.data) {
            const { access_token, user } = response.data;
            
            // Store in memory
            this.tokenSubject.next(access_token);
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
            
            // Store in both Ionic Storage and localStorage for compatibility
            await this.storage.set(this.TOKEN_KEY, access_token);
            await this.storage.set(this.USER_KEY, user);
            localStorage.setItem(this.TOKEN_KEY, access_token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          }
        }),
        catchError((error) => {
          console.error('Login error:', error);
          throw error;
        })
      );
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Clear memory
      this.tokenSubject.next(null);
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      
      // Clear both storage systems
      await this.storage.remove(this.TOKEN_KEY);
      await this.storage.remove(this.USER_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      
      // Redirect to login
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Request password reset
   */
  requestPasswordReset(email: string): Observable<ApiResponse> {
    const request: PasswordResetRequest = { email };
    return this.apiService.post<ApiResponse>('/auth/forgot-password', request);
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<ApiResponse> {
    const request = { token, new_password: newPassword };
    return this.apiService.post<ApiResponse>('/auth/reset-password', request);
  }

  /**
   * Get current user
   */
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(requiredRole: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const roleHierarchy = {
      'ADMIN': 4,
      'SUPERVISOR': 3,
      'MECANICO': 2,
      'USUARIO': 1
    };

    const userLevel = roleHierarchy[user.perfil as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userLevel >= requiredLevel;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasPermission('ADMIN');
  }

  /**
   * Check if user is supervisor or above
   */
  isSupervisor(): boolean {
    return this.hasPermission('SUPERVISOR');
  }

  /**
   * Check if user is mechanic or above
   */
  isMechanic(): boolean {
    return this.hasPermission('MECANICO');
  }

  /**
   * Refresh user data
   */
  refreshUserData(): Observable<Usuario> {
    const userId = this.getCurrentUser()?.id;
    if (!userId) {
      return of();
    }

    return this.apiService.get<ApiResponse<Usuario>>(`/usuarios/${userId}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.currentUserSubject.next(response.data);
            this.storage.set(this.USER_KEY, response.data);
            return response.data;
          }
          throw new Error('Failed to refresh user data');
        })
      );
  }

  /**
   * Update user profile
   */
  updateProfile(userData: Partial<Usuario>): Observable<Usuario> {
    const userId = this.getCurrentUser()?.id;
    if (!userId) {
      throw new Error('No user logged in');
    }

    return this.apiService.put<ApiResponse<Usuario>>(`/usuarios/${userId}`, userData)
      .pipe(
        tap(async (response) => {
          if (response.success && response.data) {
            this.currentUserSubject.next(response.data);
            await this.storage.set(this.USER_KEY, response.data);
          }
        }),
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error('Failed to update profile');
        })
      );
  }

  /**
   * Check token expiration
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Auto logout when token expires
   */
  checkTokenExpiration() {
    if (this.isAuthenticated() && this.isTokenExpired()) {
      this.logout();
    }
  }
}
