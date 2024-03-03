import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, map } from 'rxjs';
import { IDialogBox } from '../models/DialogBox';
import { DialogBoxComponent } from 'src/app/modules/components/dialog-box/dialog-box.component';
import { MatDialog } from '@angular/material/dialog';
import { dialogBoxConfig } from '../constants/DialogBoxConfig';

export const checkAccess = (): Observable<boolean | UrlTree> | boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // Use AuthService to get the authentication status
  return authService.getAuthenticationStatus().pipe(
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true; // Allow access
      } else {
        // Redirect to the login page if not authenticated
        return router.createUrlTree(['/login']);
      }
    })
  );
};

export const canActivate = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
):
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {
  return checkAccess();
};

export const canActivateChild = (
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
):
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {
  return checkAccess();
};

export const canActivateAdminRoutes = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
):
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {
  const authService = inject(AuthService);
  const dialog = inject(MatDialog);

  return authService.getUserRole().pipe(
    map((role) => {
      if (role === 'Admin') {
        return true;
      } else {
        const dialogBoxData: IDialogBox = {
          title: 'Unauthorized Access',
          content: 'You do not have permission to access this page.',
          buttons: [
            {
              isVisible: true,
              matDialogCloseValue: false,
              content: 'Ok',
            },
          ],
        };
        dialog.open(DialogBoxComponent, {
          ...dialogBoxConfig,
          data: dialogBoxData,
        });
        return false;
      }
    })
  );
};
