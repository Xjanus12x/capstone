// validators.ts
import {
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn,
} from '@angular/forms';
import { BackendService } from '../services/backend.service';

export function employeeNumberExistenceValidator(
  backendService: BackendService
): AsyncValidatorFn {
  return async (control: AbstractControl): Promise<ValidationErrors | null> => {
    const value: string = (control.value || '').toString().trim(); // Ensure value is a string and then trim
    if (!value) return null;
    const employeeNumberExists =
      await backendService.checkEmployeeNumberExistenceFirebase(Number(value));
    return employeeNumberExists ? { employeeNumberExists: true } : null;
  };
}
