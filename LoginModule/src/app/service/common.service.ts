import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ProfileResponse } from '../models/api.models';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class CommonService {
  private http = inject(HttpClient);
  private PROFILE_URL = environment.PROFILE_URL;

  // ── State ──────────────────────────────────────────────────────────────────
  private _profile = signal<ProfileResponse | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // ── Public read-only observables ───────────────────────────────────────────
  readonly profile$: Observable<ProfileResponse | null> = toObservable(this._profile);
  readonly loading$: Observable<boolean> = toObservable(this._loading);
  readonly error$: Observable<string | null> = toObservable(this._error);

  // ── Snapshot helpers ───────────────────────────────────────────────────────
  getProfile(): ProfileResponse | null { return this._profile(); }
  clearProfile(): void { this._profile.set(null); }
  clearError(): void { this._error.set(null); }
  refresh(): Observable<ProfileResponse> { return this.getYourProfile(); }

  // ── API ────────────────────────────────────────────────────────────────────
  getYourProfile(): Observable<ProfileResponse> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.get<ProfileResponse>(this.PROFILE_URL).pipe(
      tap((profile) => {
        this._loading.set(false);
        this._profile.set(profile);
      }),
      catchError((err: HttpErrorResponse) => {
        this._loading.set(false);
        this._error.set(err.message);
        throw err;
      })
    );
  }
}
