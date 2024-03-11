// import { inject } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import {
//   UrlTree,
//   Router,
//   ActivatedRouteSnapshot,
//   RouterStateSnapshot,
// } from '@angular/router';
// import { Observable, catchError, map, switchMap, throwError } from 'rxjs';
// import { DialogBoxComponent } from 'src/app/modules/components/dialog-box/dialog-box.component';
// import { AuthService } from '../services/auth.service';
// import { BackendService } from '../services/backend.service';
// import { ISubmittedIGCF } from '../models/SubmittedIgcf';
// import { dialogBoxConfig } from '../constants/DialogBoxConfig';
// import { IDialogBox } from '../models/DialogBox';

// export const canAccessSettingPercentages = (
//   route: ActivatedRouteSnapshot,
//   state: RouterStateSnapshot
// ):
//   | Observable<boolean | UrlTree>
//   | Promise<boolean | UrlTree>
//   | boolean
//   | UrlTree => {
//   const authService = inject(AuthService);
//   const backendService = inject(BackendService);
//   const router = inject(Router);
//   const dialog = inject(MatDialog);

//   return authService.getEmployeeDepartment().pipe(
//     switchMap((deptName) => {
//       return backendService.getIgcfInformations(deptName).pipe(
//         map((response) => {
//           console.log(deptName, response);

//           const data = response.data as ISubmittedIGCF[];          
//           if (data.length === 0) {
//             const dialogBoxData: IDialogBox = {
//               title: 'Percentages Unavailable',
//               content:
//                 'There is currently no set of percentages available. Please check back later or contact support for assistance.',
//               buttons: [
//                 {
//                   isVisible: true,
//                   matDialogCloseValue: false,
//                   content: 'OK',
//                 },
//               ],
//             };
//             dialog.open(DialogBoxComponent, {
//               ...dialogBoxConfig,
//               data: dialogBoxData,
//             });
//             return false;
//           } else {
//             return true;
//           }
//         }),
//         catchError((error) => {
//           console.error('Error fetching IGCF information:', error);
//           // Handle errors here (e.g., show an error message to the user)
//           return throwError(error);
//         })
//       );
//     }),
//     catchError((error) => {
//       console.error('Error fetching employee department:', error);
//       // Handle errors related to fetching employee department
//       return throwError(error);
//     })
//   );
// };
