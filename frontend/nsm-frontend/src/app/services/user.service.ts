import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserDto } from '../models/user.dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly api = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getProviders(): Observable<UserDto[]> {
    return this.http
      .get<{ providers: UserDto[] }>(`${this.api}/users/providers`, { withCredentials: true })
      .pipe(map((res) => res.providers));
  }
}
