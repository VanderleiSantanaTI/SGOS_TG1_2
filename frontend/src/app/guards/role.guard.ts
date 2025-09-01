import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const requiredRole = route.data['requiredRole'];
    
    if (!requiredRole) {
      return new Observable(observer => {
        observer.next(true);
        observer.complete();
      });
    }

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          return this.router.createUrlTree(['/login']);
        }

        if (this.authService.hasPermission(requiredRole)) {
          return true;
        } else {
          return this.router.createUrlTree(['/dashboard']);
        }
      })
    );
  }
}
