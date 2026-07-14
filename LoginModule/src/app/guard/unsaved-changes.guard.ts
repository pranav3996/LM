import { CanDeactivateFn } from '@angular/router';
import { defer, of } from 'rxjs';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

// defer() is used so confirm() is only called at subscription time (when navigation
// is actually attempted), not eagerly when the guard function is first invoked.
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) return of(true);
  return defer(() => of(confirm('You have unsaved changes. Leave anyway?')));
};
