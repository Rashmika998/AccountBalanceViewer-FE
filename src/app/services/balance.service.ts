import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBasePath } from 'src/utils/constants';

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  private balanceUrl = `${apiBasePath}/Balance`;
  private uploadBalanceUrl = `${apiBasePath}/AccountBalance`;

  constructor(private http: HttpClient) {}

  getBalance(): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(this.balanceUrl, { headers: headers });
  }

  uploadBalance(data: any): Observable<any> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(this.uploadBalanceUrl, data, {
      headers: headers,
    });
  }
}
