import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Cross-field validator applied at the FormGroup level.
 * Compares two sibling controls by name and sets a `passwordMismatch`
 * error on the group when they differ.
 *
 * Usage:
 *   fb.group({ ... }, { validators: passwordMatchValidator('password', 'confirmPassword') })
 */
export function passwordMatchValidator(
  passwordKey: string,
  confirmKey: string
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;

    // Only validate once the confirm field has a value
    if (!confirm) return null;

    return password === confirm ? null : { passwordMismatch: true };
  };
}
