# Angular Signals Review — LoginModule

> Angular version inferred from cache: **22.0.5** (Angular 19+ Signals API fully available)
> Analysis covers all components, services, guards, interceptors, validators, and NgRx store slices.

---

## Table of Contents

1. [Header Component](#1-header-component)
2. [AppComponent](#2-appcomponent)
3. [PasswordReset Component](#3-passwordreset-component)
4. [UserList Component](#4-userlist-component)
5. [UpdateUser Component](#5-updateuser-component)
6. [Login Component](#6-login-component)
7. [AdminRegister Component](#7-adminregister-component)
8. [ChangePassword Component](#8-changepassword-component)
9. [AuthService](#9-authservice)
10. [AdminService](#10-adminservice)
11. [CommonService](#11-commonservice)
12. [PasswordService](#12-passwordservice)
13. [What to Keep as RxJS](#what-to-keep-as-rxjs)
14. [Summary Table](#summary-table)

---

## 1. Header Component

**File:** `src/app/components/header/header.component.ts`

### Finding 1.1 — Plain boolean fields kept in sync via subscription

| Attribute | Value |
|---|---|
| Lines | 20–27 |
| Signal type | `signal()` + `toSignal()` |
| Priority | **High** |

**Current implementation:**
```ts
isAuthenticated = false;
isAdmin = false;
isUser = false;

constructor() {
  this.authService.currentUser$.pipe(takeUntilDestroyed()).subscribe((user) => {
    this.isAuthenticated = !!user;
    this.isAdmin = user?.role === 'ADMIN';
    this.isUser = user?.role === 'USER';
  });
}
```

**Recommended implementation:**
```ts
import { toSignal } from '@angular/core/rxjs-interop';
import { computed } from '@angular/core';

private currentUser = toSignal(this.authService.currentUser$, { initialValue: null });

readonly isAuthenticated = computed(() => !!this.currentUser());
readonly isAdmin        = computed(() => this.currentUser()?.role === 'ADMIN');
readonly isUser         = computed(() => this.currentUser()?.role === 'USER');
```

**Reason:** The three boolean fields are purely derived from `currentUser$`. Using `toSignal` + `computed` eliminates the manual subscription, removes the `takeUntilDestroyed` boilerplate, and makes the derivation declarative. The template reads `isAuthenticated()` instead of `isAuthenticated`, which is the Angular 19+ idiomatic pattern. Change detection becomes signal-aware and only re-runs when the signal value actually changes.

---

## 2. AppComponent

**File:** `src/app/app.component.ts`

### Finding 2.1 — `isLoginPage()` called on every change-detection cycle

| Attribute | Value |
|---|---|
| Lines | 18–22 |
| Signal type | `toSignal()` + `computed()` |
| Priority | **Medium** |

**Current implementation:**
```ts
private routesWithoutHeader: string[] = ['/login', '/', '/user-register', '/forgot-password', '/reset-password'];

isLoginPage(): boolean {
  const urlWithoutQueryParams = this.router.url.split('?')[0];
  return this.routesWithoutHeader.includes(urlWithoutQueryParams);
}
```
The template calls `isLoginPage()` as a method, so it re-evaluates on every CD cycle.

**Recommended implementation:**
```ts
import { toSignal } from '@angular/core/rxjs-interop';
import { computed } from '@angular/core';
import { NavigationEnd, filter, map } from 'rxjs';

private readonly routesWithoutHeader = new Set(['/login', '/', '/user-register', '/forgot-password', '/reset-password']);

private readonly currentUrl = toSignal(
  this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    map((e) => e.urlAfterRedirects.split('?')[0])
  ),
  { initialValue: this.router.url.split('?')[0] }
);

readonly isLoginPage = computed(() => this.routesWithoutHeader.has(this.currentUrl()));
```
Template: `@if (!isLoginPage()) { <app-header /> }`

**Reason:** Converts a method call (re-evaluated every CD cycle) into a `computed` signal that only recalculates when the router URL actually changes. Also replaces the `string[]` with a `Set` for O(1) lookup.

---

## 3. PasswordReset Component

**File:** `src/app/components/passwordreset/passwordreset.component.ts`

### Finding 3.1 — Manual `Subscription` bag for NgRx store selectors

| Attribute | Value |
|---|---|
| Lines | 30–31, 43–44 |
| Signal type | `toSignal()` |
| Priority | **High** |

**Current implementation:**
```ts
private subs = new Subscription();
otpRequested = false;
otpVerified = false;

ngOnInit(): void {
  this.subs.add(this.store.select(selectOtpRequested).subscribe((v) => (this.otpRequested = v)));
  this.subs.add(this.store.select(selectOtpVerified).subscribe((v) => (this.otpVerified = v)));
}

ngOnDestroy(): void {
  clearInterval(this.timer);
  this.subs.unsubscribe();
  ...
}
```

**Recommended implementation:**
```ts
import { toSignal } from '@angular/core/rxjs-interop';

readonly otpRequested = toSignal(this.store.select(selectOtpRequested), { initialValue: false });
readonly otpVerified  = toSignal(this.store.select(selectOtpVerified),  { initialValue: false });
// Remove: private subs, ngOnInit subscriptions, subs.unsubscribe() in ngOnDestroy
```
Template: `@if (otpRequested()) { ... }` and `@if (otpVerified()) { ... }`

**Reason:** `toSignal` auto-unsubscribes when the component is destroyed (tied to the injection context). Eliminates the `Subscription` bag, the manual `ngOnInit` wiring, and the `subs.unsubscribe()` call. The `timer` cleanup in `ngOnDestroy` is unrelated and stays.

### Finding 3.2 — `resendDisabled` and `countdown` as plain mutable fields

| Attribute | Value |
|---|---|
| Lines | 28–29 |
| Signal type | `signal()` |
| Priority | **Low** |

**Current implementation:**
```ts
resendDisabled = false;
countdown = 60;
```

**Recommended implementation:**
```ts
readonly resendDisabled = signal(false);
readonly countdown      = signal(60);

// In startTimer():
this.countdown.set(60);
this.timer = setInterval(() => {
  if (this.countdown() > 0) { this.countdown.update(c => c - 1); }
  else { clearInterval(this.timer); this.resendDisabled.set(false); }
}, 1000);

// In sendOTP() / resendOTP():
this.resendDisabled.set(true);
```

**Reason:** These are local UI state values that drive template rendering. Wrapping them in `signal()` makes mutations explicit and enables fine-grained change detection when the component is eventually migrated to `ChangeDetectionStrategy.OnPush`.

---

## 4. UserList Component

**File:** `src/app/components/userlist/userlist.component.ts`

### Finding 4.1 — `users` plain array kept in sync with `users$` via subscription

| Attribute | Value |
|---|---|
| Lines | 36, 43–44 |
| Signal type | `toSignal()` |
| Priority | **High** |

**Current implementation:**
```ts
users: UserRecord[] = [];

constructor() {
  this.adminService.users$.pipe(takeUntilDestroyed()).subscribe((users) => (this.users = users));
}
```
`users$` is also exposed as an `AsyncPipe` observable in the template, so the component holds a redundant mutable copy.

**Recommended implementation:**
```ts
import { toSignal } from '@angular/core/rxjs-interop';

readonly users = toSignal(this.adminService.users$, { initialValue: [] as UserRecord[] });
// Remove: constructor subscription, plain `users` field
```
All internal methods (`toggleSelectAll`, `isSelected`, `onCheckboxChange`, `deleteSelectedUsers`, `downloadCSV`, `downloadExcel`) already reference `this.users` — they now call `this.users()`.

**Reason:** Eliminates the dual-source-of-truth problem (observable + mutable copy). `toSignal` keeps the array reactive and auto-cleans up.

### Finding 4.2 — `selectedUsers` and `allSelected` as plain mutable fields

| Attribute | Value |
|---|---|
| Lines | 37–38 |
| Signal type | `signal()` |
| Priority | **Low** |

**Current implementation:**
```ts
selectedUsers: UserRecord[] = [];
allSelected = false;
```

**Recommended implementation:**
```ts
readonly selectedUsers = signal<UserRecord[]>([]);
readonly allSelected   = signal(false);
```
All mutation sites (`toggleSelectAll`, `onCheckboxChange`, `deleteSelectedUsers`) use `.set()` / `.update()`.

**Reason:** Local UI selection state is a textbook `signal()` use case. Makes mutations traceable and prepares the component for `OnPush`.

---

## 5. UpdateUser Component

**File:** `src/app/components/updateuser/updateuser.component.ts`

### Finding 5.1 — `userData` plain object kept in sync with `selectedUser$` via subscription

| Attribute | Value |
|---|---|
| Lines | 35–41 |
| Signal type | `toSignal()` + `computed()` |
| Priority | **High** |

**Current implementation:**
```ts
userData: Partial<UserData> = {};

constructor() {
  this.adminService.selectedUser$.pipe(takeUntilDestroyed()).subscribe((user) => {
    if (user) {
      const { firstName, lastName, email, enabled, role, city } = user;
      this.userData = { firstName, lastName, email, enabled, role, city };
    }
  });
}
```

**Recommended implementation:**
```ts
import { toSignal } from '@angular/core/rxjs-interop';
import { computed } from '@angular/core';

private readonly selectedUser = toSignal(this.adminService.selectedUser$, { initialValue: null });

readonly userData = computed<Partial<UserData>>(() => {
  const user = this.selectedUser();
  if (!user) return {};
  const { firstName, lastName, email, enabled, role, city } = user;
  return { firstName, lastName, email, enabled, role, city };
});
```

**Reason:** The `userData` object is a pure projection of `selectedUser`. A `computed` signal makes this relationship explicit, removes the constructor subscription, and ensures `userData` is always consistent with the store without manual assignment.

---

## 6. Login Component

**File:** `src/app/components/login/login.component.ts`

### Finding 6.1 — `loading$` and `error$` as raw observables consumed via `AsyncPipe`

| Attribute | Value |
|---|---|
| Lines | 22–23 |
| Signal type | `toSignal()` |
| Priority | **Medium** |

**Current implementation:**
```ts
loading$ = this.store.select(selectAuthLoading);
error$   = this.store.select(selectAuthError);
```
Template uses `async` pipe: `*ngIf="loading$ | async"`.

**Recommended implementation:**
```ts
import { toSignal } from '@angular/core/rxjs-interop';

readonly loading = toSignal(this.store.select(selectAuthLoading), { initialValue: false });
readonly error   = toSignal(this.store.select(selectAuthError),   { initialValue: null });
```
Template: `@if (loading()) { ... }` and `@if (error()) { ... }`

**Reason:** Removes `AsyncPipe` dependency and the risk of multiple subscriptions. Signals integrate natively with the new `@if` / `@for` control flow syntax. `toSignal` handles subscription lifecycle automatically.

---

## 7. AdminRegister Component

**File:** `src/app/components/admin-register/admin-register.component.ts`

### Finding 7.1 — `loading$` and `error$` as raw observables

| Attribute | Value |
|---|---|
| Lines | 26–27 |
| Signal type | `toSignal()` |
| Priority | **Medium** |

**Current implementation:**
```ts
error$   = this.store.select(selectUserError);
loading$ = this.store.select(selectUserLoading);
```

**Recommended implementation:**
```ts
readonly error   = toSignal(this.store.select(selectUserError),   { initialValue: null });
readonly loading = toSignal(this.store.select(selectUserLoading), { initialValue: false });
```

**Reason:** Same rationale as Finding 6.1. Consistent signal-based template bindings across all form components.

---

## 8. ChangePassword Component

**File:** `src/app/components/changepassword/changepassword.component.ts`

### Finding 8.1 — `loading$` and `error$` as raw observables

| Attribute | Value |
|---|---|
| Lines | 28–29 |
| Signal type | `toSignal()` |
| Priority | **Medium** |

**Current implementation:**
```ts
error$   = this.store.select(selectPasswordError);
loading$ = this.store.select(selectPasswordLoading);
```

**Recommended implementation:**
```ts
readonly error   = toSignal(this.store.select(selectPasswordError),   { initialValue: null });
readonly loading = toSignal(this.store.select(selectPasswordLoading), { initialValue: false });
```

**Reason:** Same rationale as Finding 6.1.

---

## 9. AuthService

**File:** `src/app/service/auth.service.ts`

### Finding 9.1 — `_currentUser$` BehaviorSubject used as internal state

| Attribute | Value |
|---|---|
| Lines | 32–33 |
| Signal type | `signal()` + `toObservable()` |
| Priority | **Medium** |

**Current implementation:**
```ts
private _currentUser$ = new BehaviorSubject<AuthUser | null>(this.rehydrate());
readonly currentUser$: Observable<AuthUser | null> = this._currentUser$.asObservable();
```
Consumers call `.next()` to mutate and subscribe to `currentUser$` to react.

**Recommended implementation:**
```ts
import { signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

private readonly _currentUser = signal<AuthUser | null>(this.rehydrate());

// Keep the observable for backward-compat consumers (interceptor, header)
readonly currentUser$ = toObservable(this._currentUser);

// Snapshot helper stays the same
getCurrentUser(): AuthUser | null { return this._currentUser(); }

// Mutations: replace .next() with .set()
// e.g. this._currentUser.set({ ... }) instead of this._currentUser$.next({ ... })
```

**Reason:** `_currentUser` is synchronous state that happens to be shared. A `signal` is the correct primitive; `toObservable` preserves the existing `currentUser$` contract for the interceptor and `HeaderComponent` without a breaking change. `BehaviorSubject.getValue()` calls become simple `this._currentUser()` reads.

> **Note:** `refreshTokenSubject` (used for token-refresh coordination in the interceptor) is a true async coordination primitive — keep it as `BehaviorSubject`.

---

## 10. AdminService

**File:** `src/app/service/admin.service.ts`

### Finding 10.1 — Five BehaviorSubjects used as internal state store

| Attribute | Value |
|---|---|
| Lines | 22–26 |
| Signal type | `signal()` + `toObservable()` |
| Priority | **Medium** |

**Current implementation:**
```ts
private _users$          = new BehaviorSubject<UserRecord[]>([]);
private _selectedUser$   = new BehaviorSubject<UserRecord | null>(null);
private _uploadProgress$ = new BehaviorSubject<number | null>(null);
private _loading$        = new BehaviorSubject<boolean>(false);
private _error$          = new BehaviorSubject<string | null>(null);
```

**Recommended implementation:**
```ts
import { signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

private readonly _users          = signal<UserRecord[]>([]);
private readonly _selectedUser   = signal<UserRecord | null>(null);
private readonly _uploadProgress = signal<number | null>(null);
private readonly _loading        = signal(false);
private readonly _error          = signal<string | null>(null);

// Preserve public observable API for components still using AsyncPipe
readonly users$          = toObservable(this._users);
readonly selectedUser$   = toObservable(this._selectedUser);
readonly uploadProgress$ = toObservable(this._uploadProgress);
readonly loading$        = toObservable(this._loading);
readonly error$          = toObservable(this._error);

// Snapshot helpers become direct reads
getUsers():        UserRecord[]       { return this._users(); }
getSelectedUser(): UserRecord | null  { return this._selectedUser(); }
```
All `.next()` calls inside API methods become `.set()` / `.update()`.

**Reason:** These five subjects are pure synchronous state containers — no async coordination, no multicasting needed. Signals are the correct primitive. `toObservable` preserves the existing public API so no component changes are required in the first migration step.

---

## 11. CommonService

**File:** `src/app/service/common.service.ts`

### Finding 11.1 — Three BehaviorSubjects used as internal state

| Attribute | Value |
|---|---|
| Lines | 14–16 |
| Signal type | `signal()` + `toObservable()` |
| Priority | **Medium** |

**Current implementation:**
```ts
private _profile$ = new BehaviorSubject<ProfileResponse | null>(null);
private _loading$ = new BehaviorSubject<boolean>(false);
private _error$   = new BehaviorSubject<string | null>(null);
```

**Recommended implementation:**
```ts
private readonly _profile = signal<ProfileResponse | null>(null);
private readonly _loading = signal(false);
private readonly _error   = signal<string | null>(null);

readonly profile$ = toObservable(this._profile);
readonly loading$ = toObservable(this._loading);
readonly error$   = toObservable(this._error);

getProfile(): ProfileResponse | null { return this._profile(); }
```

**Reason:** Same rationale as Finding 10.1. Synchronous state should be a signal.

---

## 12. PasswordService

**File:** `src/app/service/password.service.ts`

### Finding 12.1 — Four BehaviorSubjects used as internal state

| Attribute | Value |
|---|---|
| Lines | 13–16 |
| Signal type | `signal()` + `toObservable()` |
| Priority | **Medium** |

**Current implementation:**
```ts
private _loading$      = new BehaviorSubject<boolean>(false);
private _error$        = new BehaviorSubject<string | null>(null);
private _otpRequested$ = new BehaviorSubject<boolean>(false);
private _otpVerified$  = new BehaviorSubject<boolean>(false);
```

**Recommended implementation:**
```ts
private readonly _loading      = signal(false);
private readonly _error        = signal<string | null>(null);
private readonly _otpRequested = signal(false);
private readonly _otpVerified  = signal(false);

readonly loading$      = toObservable(this._loading);
readonly error$        = toObservable(this._error);
readonly otpRequested$ = toObservable(this._otpRequested);
readonly otpVerified$  = toObservable(this._otpVerified);

isOtpRequested(): boolean { return this._otpRequested(); }
isOtpVerified():  boolean { return this._otpVerified(); }
```

**Reason:** Same rationale as Finding 10.1.

---

## What to Keep as RxJS

The following patterns are **intentionally excluded** from Signal recommendations because RxJS is the correct tool:

| Location | Pattern | Why RxJS stays |
|---|---|---|
| `auth.effects.ts`, `user.effects.ts`, `password.effects.ts` | `createEffect` + `switchMap` / `catchError` | NgRx Effects are an RxJS pipeline; Signals have no equivalent for async action orchestration |
| `http-auth.interceptor.ts` | `switchMap` for token refresh coordination | Async HTTP stream with concurrency control — RxJS is mandatory |
| `auth.service.ts` — `refreshTokenSubject` | `BehaviorSubject` used as a coordination gate | Multi-subscriber async coordination; not synchronous state |
| `auth.service.ts` — `login()`, `refreshToken()` | `Observable` return types | HTTP calls are async streams |
| `admin.service.ts` — all API methods | `Observable` return types | HTTP calls |
| `email-unique.validator.ts` | `debounceTime` + `switchMap` | Async validator with debounce — RxJS operators are essential |
| `unsaved-changes.guard.ts` | `defer` + `of` | Guard returns `Observable<boolean>` as required by the router |
| `password.effects.ts` — `timeout` operator | `timeout(10000)` | RxJS timeout on HTTP stream |
| `user-register.component.ts` — error subscription | `filter(Boolean)` + `takeUntilDestroyed` | Reacting to a store error to reset a local flag — acceptable RxJS use; could be `toSignal` + `effect` but the current approach is clear |

---

## Summary Table

| # | File | Lines | Signal Type | Priority | Description |
|---|---|---|---|---|---|
| 1.1 | `header/header.component.ts` | 20–27 | `toSignal` + `computed` | **High** | Replace 3 plain booleans + subscription with computed signals |
| 2.1 | `app.component.ts` | 18–22 | `toSignal` + `computed` | **Medium** | Replace `isLoginPage()` method call with a computed signal |
| 3.1 | `passwordreset/passwordreset.component.ts` | 30–31, 43–44 | `toSignal` | **High** | Replace `Subscription` bag + manual booleans with `toSignal` |
| 3.2 | `passwordreset/passwordreset.component.ts` | 28–29 | `signal` | **Low** | Wrap `resendDisabled` and `countdown` in `signal()` |
| 4.1 | `userlist/userlist.component.ts` | 36, 43–44 | `toSignal` | **High** | Replace mutable `users` array + subscription with `toSignal` |
| 4.2 | `userlist/userlist.component.ts` | 37–38 | `signal` | **Low** | Wrap `selectedUsers` and `allSelected` in `signal()` |
| 5.1 | `updateuser/updateuser.component.ts` | 35–41 | `toSignal` + `computed` | **High** | Replace `userData` mutation in constructor with `computed` |
| 6.1 | `login/login.component.ts` | 22–23 | `toSignal` | **Medium** | Replace `loading$` / `error$` observables with `toSignal` |
| 7.1 | `admin-register/admin-register.component.ts` | 26–27 | `toSignal` | **Medium** | Replace `loading$` / `error$` observables with `toSignal` |
| 8.1 | `changepassword/changepassword.component.ts` | 28–29 | `toSignal` | **Medium** | Replace `loading$` / `error$` observables with `toSignal` |
| 9.1 | `service/auth.service.ts` | 32–33 | `signal` + `toObservable` | **Medium** | Replace `_currentUser$` BehaviorSubject with `signal` |
| 10.1 | `service/admin.service.ts` | 22–26 | `signal` + `toObservable` | **Medium** | Replace 5 BehaviorSubjects with signals |
| 11.1 | `service/common.service.ts` | 14–16 | `signal` + `toObservable` | **Medium** | Replace 3 BehaviorSubjects with signals |
| 12.1 | `service/password.service.ts` | 13–16 | `signal` + `toObservable` | **Medium** | Replace 4 BehaviorSubjects with signals |

**Total findings: 14** across 10 files.

---

## Recommended Migration Order

1. **Services first** (Findings 9.1, 10.1, 11.1, 12.1) — converting `BehaviorSubject` → `signal` + `toObservable` is non-breaking because the public `$` observable API is preserved. No component changes needed at this step.
2. **High-priority components** (Findings 1.1, 3.1, 4.1, 5.1) — these eliminate the most boilerplate and the most error-prone manual subscriptions.
3. **Medium-priority components** (Findings 2.1, 6.1, 7.1, 8.1) — straightforward `toSignal` replacements; update templates to use `@if` / `@for` control flow at the same time.
4. **Low-priority** (Findings 3.2, 4.2) — cosmetic improvements; do last or alongside the component's other changes.
