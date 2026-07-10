import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  ApiResponse,
  UploadEvent,
  UserData,
  UserRecord,
  UserResponse,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private BASE_URL = environment.ADMIN_URL;
  private USER_REGISTER_URL = environment.USER_REGISTER_URL;

  // ── State ──────────────────────────────────────────────────────────────────
  private _users$ = new BehaviorSubject<UserRecord[]>([]);
  private _selectedUser$ = new BehaviorSubject<UserRecord | null>(null);
  private _uploadProgress$ = new BehaviorSubject<number | null>(null);
  private _loading$ = new BehaviorSubject<boolean>(false);
  private _error$ = new BehaviorSubject<string | null>(null);

  // ── Public read-only observables ───────────────────────────────────────────
  readonly users$: Observable<UserRecord[]> = this._users$.asObservable();
  readonly selectedUser$: Observable<UserRecord | null> = this._selectedUser$.asObservable();
  readonly uploadProgress$: Observable<number | null> = this._uploadProgress$.asObservable();
  readonly loading$: Observable<boolean> = this._loading$.asObservable();
  readonly error$: Observable<string | null> = this._error$.asObservable();

  // ── Snapshot helpers ───────────────────────────────────────────────────────
  getUsers(): UserRecord[] { return this._users$.getValue(); }
  getSelectedUser(): UserRecord | null { return this._selectedUser$.getValue(); }

  setUsers(users: UserRecord[]): void { this._users$.next(users); }
  setSelectedUser(user: UserRecord | null): void { this._selectedUser$.next(user); }
  clearSelectedUser(): void { this._selectedUser$.next(null); }
  clearError(): void { this._error$.next(null); }

  refresh(): Observable<UserResponse> { return this.getAllUsers(); }

  // ── API methods ────────────────────────────────────────────────────────────
  getAllUsers(): Observable<UserResponse> {
    this._loading$.next(true);
    this._error$.next(null);
    return this.http.get<UserResponse>(`${this.BASE_URL}/get-all-users`).pipe(
      tap((res) => {
        this._loading$.next(false);
        if (res?.statusCode === 200 && res.usersList) {
          this._users$.next(res.usersList);
        }
      }),
      catchError((err: HttpErrorResponse) => {
        this._loading$.next(false);
        this._error$.next(err.message);
        throw err;
      })
    );
  }

  getUsersById(userId: string): Observable<UserResponse> {
    this._loading$.next(true);
    this._error$.next(null);
    return this.http.get<UserResponse>(`${this.BASE_URL}/get-users/${userId}`).pipe(
      tap((res) => {
        this._loading$.next(false);
        if (res?.users) {
          this._selectedUser$.next(res.users);
        }
      }),
      catchError((err: HttpErrorResponse) => {
        this._loading$.next(false);
        this._error$.next(err.error?.message || err.message);
        throw err;
      })
    );
  }

  adminRegister(userData: UserData): Observable<ApiResponse> {
    this._loading$.next(true);
    this._error$.next(null);
    return this.http.post<ApiResponse>(`${this.BASE_URL}/register`, userData).pipe(
      tap(() => this._loading$.next(false)),
      catchError((err: HttpErrorResponse) => {
        this._loading$.next(false);
        this._error$.next(err.message);
        throw err;
      })
    );
  }

  userRegister(userData: UserData): Observable<ApiResponse> {
    this._loading$.next(true);
    this._error$.next(null);
    return this.http.post<ApiResponse>(this.USER_REGISTER_URL, userData).pipe(
      tap(() => this._loading$.next(false)),
      catchError((err: HttpErrorResponse) => {
        this._loading$.next(false);
        this._error$.next(err.message);
        throw err;
      })
    );
  }

  updateUser(userId: string, userData: Partial<UserData>): Observable<ApiResponse> {
    this._loading$.next(true);
    this._error$.next(null);
    return this.http.put<ApiResponse>(`${this.BASE_URL}/update/${userId}`, userData).pipe(
      tap((res) => {
        this._loading$.next(false);
        if (res?.statusCode === 200) {
          const updated = this._users$.getValue().map((u) =>
            u.id === userId ? { ...u, ...userData } : u
          );
          this._users$.next(updated as UserRecord[]);
        }
      }),
      catchError((err: HttpErrorResponse) => {
        this._loading$.next(false);
        this._error$.next(err.message);
        throw err;
      })
    );
  }

  deleteUser(userId: string): Observable<ApiResponse> {
    this._loading$.next(true);
    this._error$.next(null);
    return this.http.delete<ApiResponse>(`${this.BASE_URL}/delete/${userId}`).pipe(
      tap(() => {
        this._loading$.next(false);
        this._users$.next(this._users$.getValue().filter((u) => u.id !== userId));
      }),
      catchError((err: HttpErrorResponse) => {
        this._loading$.next(false);
        this._error$.next(err.message);
        throw err;
      })
    );
  }

  uploadFile(file: File): Observable<UploadEvent> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    this._uploadProgress$.next(0);
    this._error$.next(null);

    return this.http.post<ApiResponse>(`${this.BASE_URL}/upload`, formData, {
      reportProgress: true,
      observe: 'events',
    }).pipe(
      map((event): UploadEvent => {
        switch (event.type) {
          case HttpEventType.UploadProgress: {
            const pct = event.total ? Math.round((event.loaded / event.total) * 100) : 100;
            this._uploadProgress$.next(pct);
            return { status: 'progress', message: pct };
          }
          case HttpEventType.Response: {
            this._uploadProgress$.next(null);
            const body = event.body as ApiResponse;
            if (body?.status === 'success') {
              return { status: 'success', message: body.message, body };
            }
            return {
              status: 'error',
              message: body?.message || 'Unexpected response format.',
              errorCode: body?.statusCode ?? 'UNKNOWN',
              body,
            };
          }
          default:
            return undefined;
        }
      }),
      catchError((err: HttpErrorResponse) => {
        this._uploadProgress$.next(null);
        const message = err.error?.message || 'An error occurred';
        this._error$.next(message);
        const details = {
          statusCode: err.status,
          timestamp: new Date().toISOString(),
          message,
          description: err.message,
        };
        console.error('File upload error:', details);
        return of<UploadEvent>({ status: 'error', message, errorCode: err.status, details });
      })
    );
  }
}
