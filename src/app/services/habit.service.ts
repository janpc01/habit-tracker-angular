import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class HabitService {
    private baseUrl = `${environment.apiUrl}/habits`;

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
            `${this.baseUrl}/user/${userId}/dashboard/${dashboardId}`,
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
            `${this.baseUrl}/dashboard/${dashboardId}`,
            { headers: this.getHeaders() }
        );
    }
}
