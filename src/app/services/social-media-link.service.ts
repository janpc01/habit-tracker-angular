import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface SocialMediaLink {
  id: string;
  url: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
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

  updateLinkDimensions(linkId: string, width: number, height: number): Observable<SocialMediaLink> {
    console.log('Updating dimensions:', { linkId, width, height });
    
    return this.http.patch<SocialMediaLink>(
      `${this.baseUrl}/${linkId}/dimensions`,
      null,
      { 
        headers: this.getHeaders(),
        params: {
          width: Math.round(width).toString(),
          height: Math.round(height).toString()
        }
      }
    ).pipe(
      tap(response => console.log('Dimensions updated successfully:', response)),
      catchError((error: HttpErrorResponse) => {
        console.error('Update dimensions error:', error);
        return throwError(() => error);
      })
    );
  }

  updateLinkPosition(linkId: string, x: number, y: number): Observable<SocialMediaLink> {
    console.log('Updating position:', { linkId, x, y });
    
    return this.http.patch<SocialMediaLink>(
      `${this.baseUrl}/${linkId}/position`,
      null,
      { 
        headers: this.getHeaders(),
        params: {
          x: Math.round(x).toString(),
          y: Math.round(y).toString()
        }
      }
    ).pipe(
      tap(response => console.log('Position updated successfully:', response)),
      catchError((error: HttpErrorResponse) => {
        console.error('Update position error:', error);
        return throwError(() => error);
      })
    );
  }

  updateLink(linkId: string, updateData: { x?: number, y?: number, width?: number, height?: number }): Observable<SocialMediaLink> {
    console.log('Updating link:', { linkId, updateData });
    
    return this.http.patch<SocialMediaLink>(
      `${this.baseUrl}/${linkId}`,
      updateData,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => console.log('Link updated successfully:', response)),
      catchError((error: HttpErrorResponse) => {
        console.error('Update link error:', error);
        return throwError(() => error);
      })
    );
  }

  updateLinkPositionAndDimensions(linkId: string, x: number, y: number, width: number, height: number): Observable<SocialMediaLink> {
    console.log('Updating position and dimensions:', { linkId, x, y, width, height });
    
    return this.http.patch<SocialMediaLink>(
      `${this.baseUrl}/${linkId}/position-dimensions`,
      null,
      { 
        headers: this.getHeaders(),
        params: {
          x: Math.round(x).toString(),
          y: Math.round(y).toString(),
          width: Math.round(width).toString(),
          height: Math.round(height).toString()
        }
      }
    ).pipe(
      tap(response => console.log('Position and dimensions updated successfully:', response)),
      catchError((error: HttpErrorResponse) => {
        console.error('Update position and dimensions error:', error);
        return throwError(() => error);
      })
    );
  }
}
