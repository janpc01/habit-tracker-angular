import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private baseUrl = `${environment.apiUrl}/boards`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('token'));
  }

  createBoard(name: string): Observable<any> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.post(`${this.baseUrl}/user/${userId}`, { name }, { headers: this.getHeaders() });
  }

  getBoard(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  getUserBoards(): Observable<any> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }
    return this.http.get(`${this.baseUrl}/user/${userId}`, { headers: this.getHeaders() });
  }

  deleteBoard(boardId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/${boardId}`,
      { headers: this.getHeaders() }
    );
  }
}