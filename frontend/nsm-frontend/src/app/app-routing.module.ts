import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { CreateRequestComponent } from './pages/create-request/create-request.component';
import { LoginComponent } from './pages/login/login.component';
import { MyQuotesComponent } from './pages/my-quotes/my-quotes.component';
import { RegisterComponent } from './pages/register/register.component';
import { RequestDetailsComponent } from './pages/request-details/request-details.component';
import { RequestsListComponent } from './pages/requests-list/requests-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'requests' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'requests', component: RequestsListComponent, canActivate: [AuthGuard] },
  {
    path: 'requests/new',
    component: CreateRequestComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'resident' }
  },
  { path: 'requests/:id', component: RequestDetailsComponent, canActivate: [AuthGuard] },
  {
    path: 'my-quotes',
    component: MyQuotesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'provider' }
  },
  { path: '**', redirectTo: 'requests' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
