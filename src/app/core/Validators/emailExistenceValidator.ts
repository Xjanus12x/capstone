// validators.ts
import {
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn,
} from '@angular/forms';
import { BackendService } from '../services/backend.service';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export function emailExistenceValidator(
  backendService: BackendService,
  originalEmail?: string
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value: string = control.value || '';
    return of(value).pipe(
      debounceTime(300),
      switchMap((email) => {
        backendService.setUnconfirmedEmail(email);
        return backendService.checkEmailExistence().pipe(
          map((resultData: any) => {
            return resultData.exists ? { emailExist: true } : null;
          }),
          catchError(() => of(null)) // Handling errors, returning null for simplicity
        );
      })
    );
  };
}
