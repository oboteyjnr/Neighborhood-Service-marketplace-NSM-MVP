import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoryDto } from '../../models/category.dto';
import { ServiceRequestDto } from '../../models/service-request.dto';
import { UserDto } from '../../models/user.dto';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { RequestService } from '../../services/request.service';

@Component({
  selector: 'app-requests-list',
  templateUrl: './requests-list.component.html',
  styleUrl: './requests-list.component.css'
})
export class RequestsListComponent implements OnInit {
  private static readonly LAST_VISITED_COOKIE_PREFIX = 'nsm.lastVisitedRequest.';

  categories: CategoryDto[] = [];
  requests: ServiceRequestDto[] = [];
  loading = false;
  loggingOut = false;
  error = '';
  lastVisitedTitle = '';
  lastVisitedReviewedAt = '';

  readonly filtersForm = this.fb.group({
    status: [''],
    categoryId: [''],
    q: ['']
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly requestService: RequestService,
    private readonly categoryService: CategoryService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadLastVisitedFromCookie();
    this.loadCategories();
    this.loadRequests();
  }

  applyFilters(): void {
    this.loadRequests();
  }

  clearFilters(): void {
    this.filtersForm.reset({ status: '', categoryId: '', q: '' });
    this.loadRequests();
  }

  openDetails(id: string): void {
    this.router.navigate(['/requests', id]);
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

  private loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
      }
    });
  }

  private loadRequests(): void {
    this.loading = true;
    this.error = '';
    const values = this.filtersForm.getRawValue();
    this.requestService
      .list({
        status: values.status || undefined,
        categoryId: values.categoryId || undefined,
        q: values.q || undefined
      })
      .subscribe({
        next: (requests) => {
          this.requests = requests;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Failed to load requests';
        }
      });
  }

  private loadLastVisitedFromCookie(): void {
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      this.setLastVisitedFromCookie(currentUser);
      return;
    }

    this.authService.me().subscribe((user) => {
      if (!user) {
        this.lastVisitedTitle = '';
        this.lastVisitedReviewedAt = '';
        return;
      }

      this.setLastVisitedFromCookie(user);
    });
  }

  private setLastVisitedFromCookie(user: UserDto): void {
    const cookieName = `${RequestsListComponent.LAST_VISITED_COOKIE_PREFIX}${user.id}`;
    const cookieValue = this.readCookie(cookieName);

    if (!cookieValue) {
      this.lastVisitedTitle = '';
      this.lastVisitedReviewedAt = '';
      return;
    }

    try {
      const parsed = JSON.parse(decodeURIComponent(cookieValue)) as { title?: string; visitedAt?: string };
      this.lastVisitedTitle = parsed.title || '';
      this.lastVisitedReviewedAt = parsed.visitedAt
        ? new Date(parsed.visitedAt).toLocaleString()
        : '';
    } catch {
      this.lastVisitedTitle = '';
      this.lastVisitedReviewedAt = '';
    }
  }

  private readCookie(name: string): string | null {
    const parts = document.cookie.split(';').map((part) => part.trim());
    const target = parts.find((part) => part.startsWith(`${name}=`));
    if (!target) {
      return null;
    }

    return target.slice(name.length + 1);
  }

}
