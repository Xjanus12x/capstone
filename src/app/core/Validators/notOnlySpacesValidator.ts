import { AbstractControl, ValidatorFn } from '@angular/forms';

export function notOnlySpacesValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
  
    if (!control.value || control.value.trim() === '') {
      return { onlySpaces: true };
    }
    return null;
  };
  
}

