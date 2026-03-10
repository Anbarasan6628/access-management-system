import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChangeRequest, CreateRequestDto, UpdateRequestDto, PagedResult } from '../../models/request.model';
import { AuditLog } from '../../models/audit.model';  // ← ADD THIS IMPORT

@Injectable({ providedIn: 'root' })
export class RequestService {
  private http = inject(HttpClient);
  private readonly API = 'https://localhost:44363/api/requests';
  private readonly AUDIT_API = 'https://localhost:44363/api/audit'; // ← ADD THIS

  // ── GET ALL PAGINATED ─────────────────
  getAll(pageNumber = 1, pageSize = 10): Observable<PagedResult<ChangeRequest>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    return this.http.get<PagedResult<ChangeRequest>>(this.API, { params });
  }

  // ── GET BY ID ─────────────────────────
  getById(id: number): Observable<ChangeRequest> {
    return this.http.get<ChangeRequest>(`${this.API}/${id}`);
  }

  // ── GET AUDIT LOGS ────────────────────  ← ADD THIS
  getAuditLogs(requestId: number): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.AUDIT_API}/${requestId}`);
  }

  // ── CREATE ────────────────────────────
  create(dto: CreateRequestDto): Observable<ChangeRequest> {
    const formData = new FormData();
    formData.append('title',               dto.title);
    formData.append('description',         dto.description);
    formData.append('category',            dto.category.toString());
    formData.append('priority',            dto.priority.toString());
    formData.append('assignedReviewerId',  dto.assignedReviewerId.toString());
    if (dto.attachment)
      formData.append('attachment', dto.attachment);
    return this.http.post<ChangeRequest>(this.API, formData);
  }

  // ── UPDATE ────────────────────────────
  update(id: number, dto: UpdateRequestDto): Observable<ChangeRequest> {
    const formData = new FormData();
    formData.append('title',               dto.title);
    formData.append('description',         dto.description);
    formData.append('category',            dto.category.toString());
    formData.append('priority',            dto.priority.toString());
    formData.append('assignedReviewerId',  dto.assignedReviewerId.toString());
    if (dto.attachment)
      formData.append('attachment', dto.attachment);
    return this.http.put<ChangeRequest>(`${this.API}/${id}`, formData);
  }

  // ── STATE TRANSITIONS ─────────────────
  submit(id: number): Observable<any> {
    return this.http.post(`${this.API}/${id}/submit`, {});
  }

  startReview(id: number): Observable<any> {
    return this.http.post(`${this.API}/${id}/review`, {});
  }

  approve(id: number): Observable<any> {
    return this.http.post(`${this.API}/${id}/approve`, {});
  }

  reject(id: number, reason: string): Observable<any> {
    return this.http.post(`${this.API}/${id}/reject`, { reason });
  }

  sendBack(id: number): Observable<any> {
    return this.http.post(`${this.API}/${id}/sendback`, {});
  }

  provision(id: number): Observable<any> {
    return this.http.post(`${this.API}/${id}/provision`, {});
  }

  close(id: number): Observable<any> {
    return this.http.post(`${this.API}/${id}/close`, {});
  }
}