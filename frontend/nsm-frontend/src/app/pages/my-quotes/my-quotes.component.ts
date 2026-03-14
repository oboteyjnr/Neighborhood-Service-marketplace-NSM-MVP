import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuoteDto } from '../../models/quote.dto';
import { AuthService } from '../../services/auth.service';
import { QuoteService } from '../../services/quote.service';

@Component({
  selector: 'app-my-quotes',
  templateUrl: './my-quotes.component.html',
  styleUrl: './my-quotes.component.css'
})
export class MyQuotesComponent implements OnInit {
  quotes: QuoteDto[] = [];
  loading = false;
  loggingOut = false;
  error = '';

  constructor(
    private readonly authService: AuthService,
    private readonly quoteService: QuoteService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.quoteService.getAssignedToMe().subscribe({
      next: (quotes) => {
        this.quotes = quotes;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load assigned quotes';
        this.loading = false;
      }
    });
  }

  openRequest(quote: QuoteDto): void {
    const requestId = this.getRequestId(quote);
    this.router.navigate(['/requests', requestId]);
  }

  getRequestLabel(quote: QuoteDto): string {
    return typeof quote.requestId === 'string' ? quote.requestId : quote.requestId.title;
  }

  isDirectAssignment(quote: QuoteDto): boolean {
    return quote.assignmentSource === 'direct_assignment';
  }

  private getRequestId(quote: QuoteDto): string {
    return typeof quote.requestId === 'string' ? quote.requestId : quote.requestId._id;
  }

  logout(): void {
    if (this.loggingOut) {
      return;
    }

    this.loggingOut = true;
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to logout';
        this.loggingOut = false;
      }
    });
  }

}
