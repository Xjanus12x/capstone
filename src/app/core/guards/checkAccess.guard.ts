import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, map } from 'rxjs';

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
