import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { QuoteDto } from '../models/quote.dto';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private readonly api = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  submit(payload: { requestId: string; price: number; daysToComplete: number; message?: string }): Observable<QuoteDto> {
    return this.http
      .post<{ quote: QuoteDto }>(`${this.api}/quotes`, payload, { withCredentials: true })
      .pipe(map((res) => res.quote));
  }

  getByRequestId(requestId: string): Observable<QuoteDto[]> {
    return this.http
      .get<{ quotes: QuoteDto[] }>(`${this.api}/quotes/request/${requestId}`, { withCredentials: true })
      .pipe(map((res) => res.quotes));
  }

  getMine(): Observable<QuoteDto[]> {
    return this.http
      .get<{ quotes: QuoteDto[] }>(`${this.api}/quotes/my`, { withCredentials: true })
      .pipe(map((res) => res.quotes));
  }

  getAssignedToMe(): Observable<QuoteDto[]> {
    return this.http
      .get<{ quotes: QuoteDto[] }>(`${this.api}/quotes/my/assigned`, { withCredentials: true })
      .pipe(map((res) => res.quotes));
  }

  accept(quoteId: string): Observable<QuoteDto> {
    return this.http
      .post<{ quote: QuoteDto }>(`${this.api}/quotes/${quoteId}/accept`, {}, { withCredentials: true })
      .pipe(map((res) => res.quote));
  }
}
