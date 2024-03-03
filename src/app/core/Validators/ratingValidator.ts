import { AbstractControl, ValidatorFn } from '@angular/forms';

export function ratingRangeValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const rating = control.value;

    // Check if the input value is within the range of 0 to 4
    if (rating !== null && (isNaN(rating) || rating < 0 || rating > 4)) {
      return { range: true }; // Return an error object if the value is not within the range
    }

    return null; // Return null if the value is valid
  };
}
