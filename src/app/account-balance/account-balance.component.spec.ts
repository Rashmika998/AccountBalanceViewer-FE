import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AccountBalanceComponent } from './account-balance.component';
import { BalanceService } from '../services/balance.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'customCurrency' })
class MockCustomCurrencyPipe implements PipeTransform {
  transform(value: number): string {
    return `$${value.toFixed(2)}`;
  }
}
class MockBalanceService {
  getBalance() {
    return of({
      rnD: 1000,
      canteen: 200,
      ceoCarExpenses: 500,
      marketing: 300,
      parkingFines: 100,
    });
  }
}

class MockAuthService {
  isTokenExpired() {
    return false;
  }

  clearAuthData() {}

  logout() {
    return of({});
  }
}

class MockRouter {
  navigate(path: string[]) {}
}

describe('AccountBalanceComponent', () => {
  let component: AccountBalanceComponent;
  let fixture: ComponentFixture<AccountBalanceComponent>;
  let balanceService: BalanceService;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountBalanceComponent, MockCustomCurrencyPipe],
      providers: [
        { provide: BalanceService, useClass: MockBalanceService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountBalanceComponent);
    component = fixture.componentInstance;
    balanceService = TestBed.inject(BalanceService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();

    spyOn(authService, 'clearAuthData');
    spyOn(router, 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login if token is expired', () => {
    spyOn(authService, 'isTokenExpired').and.returnValue(true);

    component.ngOnInit();

    expect(authService.clearAuthData).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/user-login']);
  });

  it('should fetch balance data on init', fakeAsync(() => {
    spyOn(balanceService, 'getBalance').and.callThrough();

    component.ngOnInit();
    tick();

    expect(balanceService.getBalance).toHaveBeenCalled();
    expect(component.balanceData).toEqual({
      rnD: 1000,
      canteen: 200,
      ceoCarExpenses: 500,
      marketing: 300,
      parkingFines: 100,
    });
    expect(component.isLoading).toBeFalse();
  }));

  it('should display loading spinner while fetching balance', () => {
    component.isLoading = true;
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner).toBeTruthy();
  });

  it('should hide loading spinner after fetching balance', fakeAsync(() => {
    component.isLoading = true;

    component.fetchBalance();
    tick();

    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner).toBeFalsy();
  }));

  it('should handle fetch balance error', fakeAsync(() => {
    spyOn(balanceService, 'getBalance').and.returnValue(
      throwError(() => new Error('Error fetching balance'))
    );
    spyOn(console, 'error');

    component.fetchBalance();
    tick();

    expect(console.error).toHaveBeenCalledWith(
      'Error fetching balance:',
      new Error('Error fetching balance')
    );
    expect(component.isLoading).toBeFalse();
  }));

  it('should check if user is admin', () => {
    sessionStorage.setItem('userRole', 'Admin');
    expect(component.isAdmin()).toBeTrue();

    sessionStorage.setItem('userRole', 'User');
    expect(component.isAdmin()).toBeFalse();
  });

  it('should logout and clear auth data', fakeAsync(() => {
    component.logout();
    tick();

    expect(authService.clearAuthData).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/user-login']);
  }));

  it('should handle logout error', fakeAsync(() => {
    spyOn(authService, 'logout').and.returnValue(
      throwError(() => new Error('Logout error'))
    );
    spyOn(console, 'error');

    component.logout();
    tick();

    expect(console.error).toHaveBeenCalledWith(
      'Logout error:',
      new Error('Logout error')
    );
  }));
});
