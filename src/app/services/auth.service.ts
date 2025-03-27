import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}`;
  private headers = new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('token'));

  constructor(private http: HttpClient) { }

  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { user: credentials }, {
      observe: 'response'
    });
  }

  register(userData: {email: string, password: string, password_confirmation: string}): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, { user: userData });
  }

  getUserId(): string | null {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }
  
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.sub as string | null;
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  }

  logout() {
    localStorage.removeItem('token');
  }
}