import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('token'));
  }

  createDashboard(name: string): Observable<any> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.post(`${this.baseUrl}/user/${userId}`, { name }, { headers: this.getHeaders() });
  }

  getDashboard(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  getUserDashboards(): Observable<any> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.get(`${this.baseUrl}/user/${userId}`, { headers: this.getHeaders() });
  }

  deleteDashboard(dashboardId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/${dashboardId}`,
      { headers: this.getHeaders() }
    );
  }
}
