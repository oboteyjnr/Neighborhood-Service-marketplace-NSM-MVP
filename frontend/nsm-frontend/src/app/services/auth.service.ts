import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserDto } from '../models/user.dto';

interface AuthResponse {
  user: UserDto;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = environment.apiBaseUrl;
  private readonly storageKey = 'nsm.currentUser';
  private readonly currentUserSubject = new BehaviorSubject<UserDto | null>(this.readCachedUser());

  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  get currentUser(): UserDto | null {
    return this.currentUserSubject.value;
  }

  register(payload: { name: string; email: string; password: string; role: 'resident' | 'provider' }): Observable<UserDto> {
    return this.http.post<AuthResponse>(`${this.api}/auth/register`, payload, { withCredentials: true }).pipe(
      map((res) => res.user)
    );
  }

  login(payload: { email: string; password: string }): Observable<UserDto> {
    return this.http.post<AuthResponse>(`${this.api}/auth/login`, payload, { withCredentials: true }).pipe(
      map((res) => res.user),
      tap((user) => this.setCurrentUser(user))
    );
  }

  logout(): Observable<void> {
    return this.http.post(`${this.api}/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.clearCurrentUser()),
      map(() => void 0)
    );
  }

  me(): Observable<UserDto | null> {
    return this.http.get<AuthResponse>(`${this.api}/auth/me`, { withCredentials: true }).pipe(
      map((res) => res.user),
      tap((user) => this.setCurrentUser(user)),
      catchError(() => {
        this.clearCurrentUser();
        return of(null);
      })
    );
  }

  private setCurrentUser(user: UserDto): void {
    this.currentUserSubject.next(user);
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  private clearCurrentUser(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(this.storageKey);
  }

  private readCachedUser(): UserDto | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as UserDto;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
