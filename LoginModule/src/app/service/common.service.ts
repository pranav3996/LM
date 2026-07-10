import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ProfileResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CommonService {
  private http = inject(HttpClient);
  private PROFILE_URL = environment.PROFILE_URL;

  // ── State ──────────────────────────────────────────────────────────────────
  private _profile$ = new BehaviorSubject<ProfileResponse | null>(null);
  private _loading$ = new BehaviorSubject<boolean>(false);
  private _error$ = new BehaviorSubject<string | null>(null);

  // ── Public read-only observables ───────────────────────────────────────────
  readonly profile$: Observable<ProfileResponse | null> = this._profile$.asObservable();
  readonly loading$: Observable<boolean> = this._loading$.asObservable();
  readonly error$: Observable<string | null> = this._error$.asObservable();

  // ── Snapshot helpers ───────────────────────────────────────────────────────
  getProfile(): ProfileResponse | null { return this._profile$.getValue(); }
  clearProfile(): void { this._profile$.next(null); }
  clearError(): void { this._error$.next(null); }
  refresh(): Observable<ProfileResponse> { return this.getYourProfile(); }

  // ── API ────────────────────────────────────────────────────────────────────
  getYourProfile(): Observable<ProfileResponse> {
    this._loading$.next(true);
    this._error$.next(null);
    return this.http.get<ProfileResponse>(this.PROFILE_URL).pipe(
      tap((profile) => {
        this._loading$.next(false);
        this._profile$.next(profile);
      }),
      catchError((err: HttpErrorResponse) => {
        this._loading$.next(false);
        this._error$.next(err.message);
        throw err;
      })
    );
  }
}
