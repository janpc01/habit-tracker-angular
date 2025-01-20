import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface SocialMediaLink {
  id: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocialMediaLinkService {
  private baseUrl = `${environment.apiUrl}/social-media-links`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders()
      .set('Authorization', 'Bearer ' + localStorage.getItem('token'))
      .set('Accept', 'application/json');
  }

  createLink(boardId: string, url: string): Observable<SocialMediaLink> {
    console.log('Creating link with:', { boardId, url });
    const payload = { url };

    return this.http.post<SocialMediaLink>(
      `${this.baseUrl}/board/${boardId}`,
      payload,
      { 
        headers: this.getHeaders(),
        observe: 'response'
      }
    ).pipe(
      tap(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
      }),
      map(response => {
        // If we get a 201 status, consider it successful even if we can't parse the response
        if (response.status === 201) {
          return { id: '', url } as SocialMediaLink;
        }
        return response.body as SocialMediaLink;
      }),
      catchError((error: HttpErrorResponse) => {
        // If it's a parsing error with status 201, treat it as success
        if (error.status === 201) {
          console.log('Created successfully, but response parsing failed');
          return of({ id: '', url } as SocialMediaLink);
        }
        console.error('Error details:', error);
        return throwError(() => error);
      })
    );
  }

  getBoardLinks(boardId: string): Observable<SocialMediaLink[]> {
    console.log('Getting links for board:', boardId);
    
    return this.http.get<SocialMediaLink[]>(
      `${this.baseUrl}/board/${boardId}`,
      { 
        headers: this.getHeaders()
      }
    ).pipe(
      tap(links => {
        console.log('Response links:', links);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error details:', error);
        return throwError(() => error);
      })
    );
  }

  deleteLink(linkId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${linkId}`,
      { headers: this.getHeaders() }
    );
  }
}