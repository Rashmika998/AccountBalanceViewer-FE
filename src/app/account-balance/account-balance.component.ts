import { Component, OnInit } from '@angular/core';
import { BalanceService } from '../services/balance.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-balance',
  templateUrl: './account-balance.component.html',
  styleUrls: ['./account-balance.component.scss'],
})
export class AccountBalanceComponent implements OnInit {
  balanceData: any = {};
  isLoading: boolean = false;

  constructor(
    private balanceService: BalanceService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchBalance();
    if (this.authService.isTokenExpired()) {
      this.authService.clearAuthData();
      this.router.navigate(['/user-login']);
    }
  }

  fetchBalance(): void {
    this.isLoading = true;
    this.balanceService.getBalance().subscribe({
      next: (data) => {
        this.balanceData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching balance:', error);
        this.isLoading = false;
      },
    });
  }

  isAdmin(): boolean {
    const userRole = sessionStorage.getItem('userRole');
    return userRole === 'Admin';
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: (data) => {
        this.authService.clearAuthData();
        this.router.navigate(['/user-login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
      },
    });
  }
}
