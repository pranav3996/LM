import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';
import { AdminService } from '../service/admin.service';

/**
 * Async validator factory for email uniqueness.
 * Debounces input to avoid hammering the API on every keystroke.
 *
 * Usage (3rd parameter of FormControl):
 *   fb.nonNullable.control('', [Validators.required], emailUniqueValidator(adminService))
 */
export function emailUniqueValidator(adminService: AdminService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    return control.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      take(1),
      switchMap((email: string) =>
        adminService.checkEmailExists(email).pipe(
          map((exists) => (exists ? { emailTaken: true } : null)),
          catchError(() => of(null)) // fail open — don't block submission on network error
        )
      )
    );
  };
}
