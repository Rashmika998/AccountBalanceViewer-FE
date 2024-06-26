import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AuthService } from './services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountBalanceComponent } from './account-balance/account-balance.component';
import { BalanceUploadComponent } from './balance-upload/balance-upload.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { CustomCurrencyPipe } from '../utils/custom-currency.pipe';
import { BalanceService } from './services/balance.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AccountBalanceComponent,
    BalanceUploadComponent,
    AdminLoginComponent,
    CustomCurrencyPipe,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  providers: [AuthService, BalanceService],
  bootstrap: [AppComponent],
})
export class AppModule {}
