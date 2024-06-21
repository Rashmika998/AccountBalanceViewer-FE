import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      userRole: ['Admin'],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password, userRole } = this.loginForm.value;
      this.authService.login(username, password, userRole).subscribe({
        next: (response) => {
          this.errorMessage = '';
          const { token, expiration, userRole } = response;
          this.authService.saveAuthData(token, expiration, userRole);
          this.router.navigate(['/account-balance']);
        },
        error: (error) => {
          this.errorMessage = error.error.message;
        },
      });
    } else {
      this.errorMessage = 'Please enter valid email and password.';
    }
  }
}
