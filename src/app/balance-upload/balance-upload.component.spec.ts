import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BalanceUploadComponent } from './balance-upload.component';
import { BalanceService } from '../services/balance.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';

class MockBalanceService {
  uploadBalance(data: any) {
    return of({});
  }
}

class MockAuthService {
  getUserRole() {
    return 'Admin';
  }
  isTokenExpired() {
    return false;
  }
  clearAuthData() {}
}

class MockRouter {
  navigate(path: string[]) {}
}

describe('BalanceUploadComponent', () => {
  let component: BalanceUploadComponent;
  let fixture: ComponentFixture<BalanceUploadComponent>;
  let balanceService: BalanceService;
  let authService: AuthService;
  let router: Router;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BalanceUploadComponent],
      providers: [
        { provide: BalanceService, useClass: MockBalanceService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceUploadComponent);
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

  it('should redirect to admin login if user is not admin', () => {
    spyOn(authService, 'getUserRole').and.returnValue('User');

    component.ngOnInit();

    expect(authService.clearAuthData).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/admin-login']);
  });

  it('should redirect to user login if token is expired', () => {
    spyOn(authService, 'isTokenExpired').and.returnValue(true);

    component.ngOnInit();

    expect(authService.clearAuthData).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/user-login']);
  });

  it('should handle file change and validate file type', () => {
    const event = {
      target: { files: [new File([''], 'test.xlsx')] }
    };

    component.onFileChange(event);

    expect(component.selectedFile).toBe(event.target.files[0]);
    expect(component.errorMessage).toBe('');
  });

  it('should show error message for invalid file type', () => {
    const event = {
      target: { files: [new File([''], 'test.pdf')] }
    };

    component.onFileChange(event);

    expect(component.selectedFile).toBeNull();
    expect(component.errorMessage).toBe('Invalid file type. Please upload an Excel or text file.');
  });

  it('should upload and process Excel file', () => {
    spyOn(component, 'readExcelFile');

    component.selectedFile = new File([''], 'test.xlsx');
    component.uploadFile();

    expect(component.readExcelFile).toHaveBeenCalledWith(component.selectedFile);
  });

  it('should upload and process text file', () => {
    spyOn(component, 'readTextFile');

    component.selectedFile = new File([''], 'test.txt');
    component.uploadFile();

    expect(component.readTextFile).toHaveBeenCalledWith(component.selectedFile);
  });

  it('should display success message on successful upload', () => {
    spyOn(balanceService, 'uploadBalance').and.returnValue(of({}));

    component.processData([['canteen', '100']]);

    expect(component.successMessage).toBe('File uploaded and processed successfully!');
    expect(router.navigate).toHaveBeenCalledWith(['/account-balance']);
  });

  it('should display error message on upload failure', () => {
    spyOn(balanceService, 'uploadBalance').and.returnValue(throwError({}));
    component.processData([['canteen', '100']]);

    expect(component.errorMessage).toBe('An error occurred while uploading the balance.');
  });

  it('should disable upload button when no file is selected', () => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.disabled).toBeTrue();
  });

  it('should enable upload button when a file is selected', () => {
    component.selectedFile = new File([''], 'test.xlsx');
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.disabled).toBeFalse();
  });
});
