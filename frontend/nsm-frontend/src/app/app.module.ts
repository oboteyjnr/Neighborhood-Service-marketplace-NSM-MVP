import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './pages/register/register.component';
import { RequestsListComponent } from './pages/requests-list/requests-list.component';
import { LoginComponent } from './pages/login/login.component';
import { CreateRequestComponent } from './pages/create-request/create-request.component';
import { RequestDetailsComponent } from './pages/request-details/request-details.component';
import { MyQuotesComponent } from './pages/my-quotes/my-quotes.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    RequestsListComponent,
    LoginComponent,
    CreateRequestComponent,
    RequestDetailsComponent,
    MyQuotesComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
