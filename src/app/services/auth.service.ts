import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;
  private headers = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('token'));

  constructor(private http: HttpClient) { }

  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  register(userData: {email: string, password: string}): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }

  getUserId(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decodedToken = jwtDecode(token);
    return decodedToken.sub as string | null;
  }

  logout() {
    localStorage.removeItem('token');
  }
}