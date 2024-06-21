import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AccountBalanceComponent } from './account-balance/account-balance.component';
import { BalanceUploadComponent } from './balance-upload/balance-upload.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';

const routes: Routes = [
  { path: 'user-login', component: LoginComponent },
  { path: 'account-balance', component: AccountBalanceComponent },
  { path: 'upload-balance', component: BalanceUploadComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: '', redirectTo: '/user-login', pathMatch: 'full' },
  { path: '**', redirectTo: '/user-login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
