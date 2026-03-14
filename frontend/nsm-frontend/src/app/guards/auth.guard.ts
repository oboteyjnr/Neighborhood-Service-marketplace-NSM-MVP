import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      return of(true);
    }

    return this.authService.me().pipe(map((user) => (user ? true : this.router.parseUrl('/login'))));
  }
}
