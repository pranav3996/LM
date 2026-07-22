import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  ApiResponse,
  UploadEvent,
  UserData,
  UserRecord,
  UserResponse,
} from '../models/api.models';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private BASE_URL = environment.ADMIN_URL;
  private USER_REGISTER_URL = environment.USER_REGISTER_URL;

  // ── State ──────────────────────────────────────────────────────────────────
  private readonly _users = signal<UserRecord[]>([]);
  private readonly _selectedUser = signal<UserRecord | null>(null);
  private readonly _uploadProgress = signal<number | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ── Public read-only observables ───────────────────────────────────────────
  readonly users$: Observable<UserRecord[]> = toObservable(this._users);
  readonly selectedUser$: Observable<UserRecord | null> = toObservable(this._selectedUser);
  readonly uploadProgress$: Observable<number | null> = toObservable(this._uploadProgress);
  readonly loading$: Observable<boolean> = toObservable(this._loading);
  readonly error$: Observable<string | null> = toObservable(this._error);

  // ── Snapshot helpers ───────────────────────────────────────────────────────
  getUsers(): UserRecord[] { return this._users(); }
  getSelectedUser(): UserRecord | null { return this._selectedUser(); }

  setUsers(users: UserRecord[]): void { this._users.set(users); }
  setSelectedUser(user: UserRecord | null): void { this._selectedUser.set(user); }
  clearSelectedUser(): void { this._selectedUser.set(null); }
  clearError(): void { this._error.set(null); }

  refresh(): Observable<UserResponse> { return this.getAllUsers(); }

  // ── API methods ────────────────────────────────────────────────────────────
  getAllUsers(): Observable<UserResponse> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.get<UserResponse>(`${this.BASE_URL}/get-all-users`).pipe(
      tap((res) => {
        this._loading.set(false);
        if (res?.statusCode === 200 && res.usersList) {
          this._users.set(res.usersList);
        }
      }),
      catchError((err: HttpErrorResponse) => {
        this._loading.set(false);
        this._error.set(err.message);
        throw err;
      })
    );
  }

  getUsersById(userId: string): Observable<UserResponse> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.get<UserResponse>(`${this.BASE_URL}/get-users/${userId}`).pipe(
      tap((res) => {
        this._loading.set(false);
        if (res?.users) {
          this._selectedUser.set(res.users);
        }
      }),
      catchError((err: HttpErrorResponse) => {
        this._loading.set(false);
        this._error.set(err.error?.message || err.message);
        throw err;
      })
    );
  }

  adminRegister(userData: UserData): Observable<ApiResponse> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.post<ApiResponse>(`${this.BASE_URL}/register`, userData).pipe(
      tap(() => this._loading.set(false)),
      catchError((err: HttpErrorResponse) => {
        this._loading.set(false);
        this._error.set(err.message);
        throw err;
      })
    );
  }

  userRegister(userData: UserData): Observable<ApiResponse> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.post<ApiResponse>(this.USER_REGISTER_URL, userData).pipe(
      tap(() => this._loading.set(false)),
      catchError((err: HttpErrorResponse) => {
        this._loading.set(false);
        this._error.set(err.message);
        throw err;
      })
    );
  }

  updateUser(userId: string, userData: Partial<UserData>): Observable<ApiResponse> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.put<ApiResponse>(`${this.BASE_URL}/update/${userId}`, userData).pipe(
      tap((res) => {
        this._loading.set(false);
        if (res?.statusCode === 200) {
          // Update the selected user if it matches the updated user
          this._users.update((users) =>
            users.map((u) => (u.id === userId ? { ...u, ...userData } : u))
          );
        }
      }),
      catchError((err: HttpErrorResponse) => {
        this._loading.set(false);
        this._error.set(err.message);
        throw err;
      })
    );
  }

  deleteUser(userId: string): Observable<ApiResponse> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.delete<ApiResponse>(`${this.BASE_URL}/delete/${userId}`).pipe(
      tap(() => {
        this._loading.set(false);
        this._users.update((users) => users.filter((u) => u.id !== userId));
      }),
      catchError((err: HttpErrorResponse) => {
        this._loading.set(false);
        this._error.set(err.message);
        throw err;
      })
    );
  }

  /**
   * Returns true if the email is already registered.
   * Used by the emailUniqueValidator async validator.
   */
  checkEmailExists(email: string): Observable<boolean> {
    return this.http
      .get<{ exists: boolean }>(`${this.BASE_URL}/check-email`, { params: { email } })
      .pipe(
        map((res) => res.exists),
        catchError(() => of(false))
      );
  }

  uploadFile(file: File): Observable<UploadEvent> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    this._uploadProgress.set(0);
    this._error.set(null);

    return this.http.post<ApiResponse>(`${this.BASE_URL}/upload`, formData, {
      reportProgress: true,
      observe: 'events',
    }).pipe(
      map((event): UploadEvent => {
        switch (event.type) {
          case HttpEventType.UploadProgress: {
            const pct = event.total ? Math.round((event.loaded / event.total) * 100) : 100;
            this._uploadProgress.set(pct);
            return { status: 'progress', message: pct };
          }
          case HttpEventType.Response: {
            this._uploadProgress.set(null);
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
        this._uploadProgress.set(null);
        this._error.set(err.error?.message || 'An error occurred');
        // Re-throw so the HTTP interceptor can intercept 401 and attempt a
        // token refresh. Using of() here would swallow the error and prevent
        // the interceptor's catchError from ever running.
        throw err;
      })
    );
  }
}
