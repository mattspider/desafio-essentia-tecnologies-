import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateTaskRequest,
  Task,
  TaskMetadata,
  UpdateTaskRequest,
  UpsertTaskMetadataRequest,
} from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  list(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl);
  }

  getById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateTaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, payload);
  }

  toggleCompleted(id: number): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/${id}/toggle`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getMetadata(id: number): Observable<TaskMetadata> {
    return this.http.get<TaskMetadata>(`${this.baseUrl}/${id}/metadata`);
  }

  upsertMetadata(id: number, payload: UpsertTaskMetadataRequest): Observable<TaskMetadata> {
    return this.http.put<TaskMetadata>(`${this.baseUrl}/${id}/metadata`, payload);
  }
}
