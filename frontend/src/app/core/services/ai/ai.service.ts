import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/requests`;

  // → POST api/requests/suggest-description
  suggestDescription(title: string, category: string): Observable<{ description: string }> {
    return this.http.post<{ description: string }>(
      `${this.base}/suggest-description`,
      { title, category }
    );
  }

  // → POST api/requests/{id}/score-risk
  scoreRisk(id: number): Observable<{
    score: number;
    level: string;
    reason: string;
    autoApprove: boolean;
    fromCache?: boolean;
  }> {
    return this.http.post<any>(`${this.base}/${id}/score-risk`, {});
  }
}