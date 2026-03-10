import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly API = 'https://localhost:44363/api/users';

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.API);
  }

  // ← ADD THIS
  getReviewers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API}/reviewers`);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API}/${id}`);
  }

  create(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.API, dto);
  }

  update(id: number, dto: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.API}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}