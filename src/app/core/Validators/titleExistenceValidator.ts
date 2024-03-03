// import {
//   AbstractControl,
//   ValidationErrors,
//   AsyncValidatorFn,
// } from '@angular/forms';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { BackendService } from '../services/backend.service';

// export function titleExistenceValidator(
//   backendService: BackendService
// ): AsyncValidatorFn {
//   return (control: AbstractControl): Observable<ValidationErrors | null> => {
//     const value: string = control.value || '';

//     return backendService.gettest().pipe(
//       map((titles: string[]) => {
//         const exists = titles.includes(value);
//         return exists ? { titleExists: true } : null;
//       })
//     );
//   };
// }
