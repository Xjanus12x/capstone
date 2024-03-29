import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function confirmPasswordValidator(password: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const confirmPassword = control.value;

    // Check if the confirm password matches the provided password
    if (confirmPassword !== password) {
      return { passwordMismatch: true };
    } else {
      return null;
    }
  };
}
