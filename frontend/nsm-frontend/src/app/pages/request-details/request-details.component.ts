import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { QuoteDto } from '../../models/quote.dto';
import { ServiceRequestDto } from '../../models/service-request.dto';
import { UserDto } from '../../models/user.dto';
import { AuthService } from '../../services/auth.service';
import { QuoteService } from '../../services/quote.service';
import { RequestService } from '../../services/request.service';

@Component({
  selector: 'app-request-details',
  templateUrl: './request-details.component.html',
  styleUrl: './request-details.component.css'
})
export class RequestDetailsComponent implements OnInit {
  private static readonly LAST_VISITED_COOKIE_PREFIX = 'nsm.lastVisitedRequest.';

  request: ServiceRequestDto | null = null;
  quotes: QuoteDto[] = [];
  currentUser: UserDto | null = null;
  loading = false;
  error = '';
  quoteError = '';
  actionMessage = '';

  readonly quoteForm = this.fb.group({
    price: [0, [Validators.required, Validators.min(1)]],
    daysToComplete: [1, [Validators.required, Validators.min(1), Validators.max(365)]],
    message: ['']
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly requestService: RequestService,
    private readonly quoteService: QuoteService,
    private readonly authService: AuthService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    if (!this.currentUser) {
      this.authService.me().subscribe((user) => {
        this.currentUser = user;
        if (this.request) {
          this.storeLastVisitedRequestCookie(this.request);
        }
      });
    }

    this.loadData();
  }

  get canResidentAccept(): boolean {
    if (!this.currentUser || this.currentUser.role !== 'resident' || !this.request) {
      return false;
    }

    return !['assigned', 'completed', 'cancelled'].includes(this.request.status);
  }

  get canProviderQuote(): boolean {
    if (!this.currentUser || this.currentUser.role !== 'provider' || !this.request) {
      return false;
    }

    return ['open', 'quoted'].includes(this.request.status);
  }

  submitQuote(): void {
    this.quoteError = '';
    this.actionMessage = '';

    if (this.quoteForm.invalid || !this.request) {
      this.quoteForm.markAllAsTouched();
      return;
    }

    this.quoteService
      .submit({ requestId: this.request._id, ...(this.quoteForm.getRawValue() as any) })
      .subscribe({
        next: () => {
          this.actionMessage = 'Quote submitted successfully';
          this.quoteForm.patchValue({ price: 0, daysToComplete: 1, message: '' });
          this.loadData();
        },
        error: (err) => {
          this.quoteError = err?.error?.message || 'Failed to submit quote';
        }
      });
  }

  acceptQuote(quoteId: string): void {
    this.actionMessage = '';
    this.quoteError = '';

    this.quoteService.accept(quoteId).subscribe({
      next: () => {
        this.actionMessage = 'Quote accepted successfully';
        this.loadData();
      },
      error: (err) => {
        this.quoteError = err?.error?.message || 'Failed to accept quote';
      }
    });
  }

  private loadData(): void {
    const requestId = this.route.snapshot.paramMap.get('id');
    if (!requestId) {
      this.error = 'Invalid request id';
      return;
    }

    this.loading = true;
    this.error = '';

    this.requestService.getById(requestId).subscribe({
      next: (request) => {
        this.request = request;
        this.storeLastVisitedRequestCookie(request);
        this.requestService.getQuotesForRequest(requestId).subscribe({
          next: (quotes) => {
            this.quotes = quotes;
            this.loading = false;
          },
          error: (err) => {
            this.loading = false;
            this.error = err?.error?.message || 'Failed to load quotes';
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to load request';
      }
    });
  }

  private storeLastVisitedRequestCookie(request: ServiceRequestDto): void {
    if (!this.currentUser) {
      return;
    }

    const cookieName = `${RequestDetailsComponent.LAST_VISITED_COOKIE_PREFIX}${this.currentUser.id}`;
    const payload = {
      requestId: request._id,
      title: request.title,
      visitedAt: new Date().toISOString()
    };

    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(payload))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }

}
