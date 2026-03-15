import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { QuoteDto } from '../models/quote.dto';
import { RequestStatus, ServiceRequestDto } from '../models/service-request.dto';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private readonly api = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  list(filters: { status?: string; categoryId?: string; q?: string }): Observable<ServiceRequestDto[]> {
    let params = new HttpParams();

    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.categoryId) {
      params = params.set('categoryId', filters.categoryId);
    }
    if (filters.q) {
      params = params.set('q', filters.q);
    }

    return this.http
      .get<{ requests: ServiceRequestDto[] }>(`${this.api}/requests`, { params, withCredentials: true })
      .pipe(map((res) => res.requests));
  }

  create(payload: { title: string; description: string; categoryId: string; location: string }): Observable<ServiceRequestDto> {
    return this.http
      .post<{ serviceRequest: ServiceRequestDto }>(`${this.api}/requests`, payload, { withCredentials: true })
      .pipe(map((res) => res.serviceRequest));
  }

  getById(id: string): Observable<ServiceRequestDto> {
    return this.http
      .get<{ request: ServiceRequestDto }>(`${this.api}/requests/${id}`, { withCredentials: true })
      .pipe(map((res) => res.request));
  }

  updateStatus(id: string, status: RequestStatus): Observable<ServiceRequestDto> {
    return this.http
      .patch<{ request: ServiceRequestDto }>(`${this.api}/requests/${id}/status`, { status }, { withCredentials: true })
      .pipe(map((res) => res.request));
  }

  getQuotesForRequest(requestId: string): Observable<QuoteDto[]> {
    return this.http
      .get<{ quotes: QuoteDto[] }>(`${this.api}/requests/${requestId}/quotes`, { withCredentials: true })
      .pipe(map((res) => res.quotes));
  }
}
