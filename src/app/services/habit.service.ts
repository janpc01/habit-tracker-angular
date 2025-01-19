import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class HabitService {
    private baseUrl = `${environment.apiUrl}`;
    private habitsUrl = `${this.baseUrl}/habits`;
    private completionsUrl = `${this.baseUrl}/habit-completions`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('token'));
    }

    createHabit(dashboardId: string, habitData: any): Observable<any> {
        const userId = this.authService.getUserId();
        if (!userId) {
            return throwError(() => new Error('User not authenticated'));
        }
        return this.http.post(
            `${this.habitsUrl}/user/${userId}/dashboard/${dashboardId}`,
            habitData, 
            { headers: this.getHeaders() }
        );
    }

    getHabits(dashboardId: string): Observable<any> {
        const userId = this.authService.getUserId();
        if (!userId) {
            return throwError(() => new Error('User not authenticated'));
        }
        return this.http.get(
            `${this.habitsUrl}/dashboard/${dashboardId}`,
            { headers: this.getHeaders() }
        );
    }

    logHabitCompletion(habitId: number, date: string, completed: boolean, notes?: string): Observable<any> {
      const params = {
          date,
          completed: completed.toString(),
          notes: notes || ''
      };
      
      return this.http.post(
          `${this.completionsUrl}/habit/${habitId}`,
          null,
          { 
              headers: this.getHeaders(),
              params
          }
      );
    }

    getHabitCompletions(habitId: number): Observable<any> {
        return this.http.get(
            `${this.completionsUrl}/habit/${habitId}`,
            { headers: this.getHeaders() }
        );
    }
}
