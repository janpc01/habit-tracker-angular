import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = `${environment.apiUrl}/dashboards`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  createDashboard(): Observable<any> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.post(`${this.baseUrl}/user/${userId}`, {});
  }

  getDashboard(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  getUserDashboards(): Observable<any> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.get(`${this.baseUrl}/user/${userId}`);
  }
}
