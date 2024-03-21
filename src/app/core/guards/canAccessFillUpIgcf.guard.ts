import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { BackendService } from '../services/backend.service';
import { map, switchMap } from 'rxjs/operators';
import { IDialogBox } from '../models/DialogBox';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from 'src/app/modules/components/dialog-box/dialog-box.component';
import { dialogBoxConfig } from '../constants/DialogBoxConfig';

export const canAcessFillUpIgcf = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
):
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {
  const authService = inject(AuthService);
  const backendService = inject(BackendService);
  const currentYear = new Date().getFullYear();
  const dialog = inject(MatDialog);
  return authService.getEmployeeNumber().pipe(
    switchMap((empNumber: string) => {
      return backendService.getSubmissionHistoryByEmployeeNumber(empNumber);
    }),
    map((submissionHistory: any) => {
      const history = submissionHistory.filter((submission: any) => {
        const yearOfCompletion = new Date(
          submission.completion_date
        ).getFullYear();
        return currentYear === yearOfCompletion;
      });
      console.log(history);

      if (history.length > 0) {
        const dialogBoxData: IDialogBox = {
          title: 'IGCF Submission',
          content: 'You have already submitted IGCF for this year.',
          buttons: [
            {
              isVisible: true,
              matDialogCloseValue: false,
              content: 'Ok',
            },
            {
              isVisible: false,
              matDialogCloseValue: false,
              content: '',
            },
          ],
        };
        dialog.open(DialogBoxComponent, {
          ...dialogBoxConfig,
          data: dialogBoxData,
        });
      }
      return history.length === 0;
    })
  );
};
