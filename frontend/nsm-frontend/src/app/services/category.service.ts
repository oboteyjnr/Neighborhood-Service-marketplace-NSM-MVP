import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategoryDto } from '../models/category.dto';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly api = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<CategoryDto[]> {
    return this.http
      .get<{ categories: CategoryDto[] }>(`${this.api}/categories`, { withCredentials: true })
      .pipe(map((res) => res.categories));
  }

  create(payload: { name: string; description?: string }): Observable<CategoryDto> {
    return this.http
      .post<{ category: CategoryDto }>(`${this.api}/categories`, payload, { withCredentials: true })
      .pipe(map((res) => res.category));
  }
}
