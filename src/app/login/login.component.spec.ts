import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';

class MockAuthService {
  login(username: string, password: string, userRole: string) {
    if (username === 'user@example.com' && password === 'password') {
      return of({
        token: 'fake-token',
        expiration: '2024-06-22T06:36:21.760Z',
        userRole: 'User',
      });
    } else {
      return throwError(() => ({
        error: { message: 'Invalid credentials' },
      }));
    }
  }

  saveAuthData(token: string, expiration: string, userRole: string) {}
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    const loginForm = component.loginForm;
    expect(loginForm).toBeDefined();
    expect(loginForm.get('username')?.value).toBe('');
    expect(loginForm.get('password')?.value).toBe('');
    expect(loginForm.get('userRole')?.value).toBe('User');
  });

  it('should display an error message if the form is invalid on submit', () => {
    component.onSubmit();
    fixture.detectChanges();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe(
      'Please enter valid email and password.'
    );
  });

  it('should display an error message on login failure', fakeAsync(() => {
    component.loginForm.setValue({
      username: 'user@example.com',
      password: 'wrongpassword',
      userRole: 'User',
    });

    component.onSubmit();
    tick();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Invalid credentials');
  }));
});
