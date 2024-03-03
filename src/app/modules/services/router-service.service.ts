import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  private currentRoute: string = '';

  constructor(private router: Router, private activeRoute: ActivatedRoute) {
    // Subscribe to router events to update currentRoute
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentRoute = this.getActiveRoute(this.activeRoute);
      });
  }

  private getActiveRoute(route: ActivatedRoute): string {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.routeConfig?.path || '';
  }

  isRouteActive(routePath: string): boolean {
    return this.currentRoute === routePath;
  }
  routeTo(route: string) {
    this.router.navigate([route]);
  }

}
