import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBasePath } from 'src/utils/constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginUrl = `${apiBasePath}/User/login`;
  private logoutUrl = `${apiBasePath}/User/logout`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string, userRole: string): Observable<any> {
    const headers = { 'content-type': 'application/json' };
    return this.http.post<any>(
      this.loginUrl,
      { email: username, password: password, userRole: userRole },
      { headers: headers }
    );
  }

  saveAuthData(token: string, expiration: string, userRole: string): void {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('expiration', expiration);
    sessionStorage.setItem('userRole', userRole);
  }

  clearAuthData(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('expiration');
    sessionStorage.removeItem('userRole');
  }

  getAuthToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getUserRole(): string | null {
    return sessionStorage.getItem('userRole');
  }

  getTokenExpiration(): Date | null {
    const expiration = this.getAuthToken();
    return expiration ? new Date(expiration) : null;
  }

  isTokenExpired(): boolean {
    const expiration = this.getTokenExpiration();
    return expiration ? new Date() > expiration : true;
  }

  isLoggedIn(): boolean {
    const expiration = sessionStorage.getItem('expiration');
    return expiration ? new Date(expiration) > new Date() : false;
  }

  logout(): Observable<any> {
    return this.http.post<any>(
      `${this.logoutUrl}?token=${this.getAuthToken()}`,
      {}
    );
  }
}
