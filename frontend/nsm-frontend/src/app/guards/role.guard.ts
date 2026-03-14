import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const expectedRole = route.data['role'] as 'resident' | 'provider' | undefined;

    if (!expectedRole) {
      return of(true);
    }

    const currentUser = this.authService.currentUser;
    if (currentUser) {
      return of(currentUser.role === expectedRole ? true : this.router.parseUrl('/requests'));
    }

    return this.authService.me().pipe(
      map((user) => {
        if (!user) {
          return this.router.parseUrl('/login');
        }

        return user.role === expectedRole ? true : this.router.parseUrl('/requests');
      })
    );
  }
}
