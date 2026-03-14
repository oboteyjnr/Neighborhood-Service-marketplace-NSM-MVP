import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoryDto } from '../../models/category.dto';
import { UserDto } from '../../models/user.dto';
import { CategoryService } from '../../services/category.service';
import { RequestService } from '../../services/request.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-create-request',
  templateUrl: './create-request.component.html',
  styleUrl: './create-request.component.css'
})
export class CreateRequestComponent implements OnInit {
  categories: CategoryDto[] = [];
  providers: UserDto[] = [];
  loading = false;
  error = '';

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    categoryId: ['', [Validators.required]],
    location: ['', [Validators.required, Validators.minLength(2)]],
    providerId: ['', [Validators.required]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly requestService: RequestService,
    private readonly categoryService: CategoryService,
    private readonly userService: UserService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
      }
    });

    this.userService.getProviders().subscribe({
      next: (providers) => {
        this.providers = providers;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load providers';
      }
    });
  }

  submit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.requestService.create(this.form.getRawValue() as any).subscribe({
      next: (request) => {
        this.loading = false;
        this.router.navigate(['/requests', request._id]);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to create request';
      }
    });
  }

}
