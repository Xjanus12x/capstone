
import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class RouterService {
  private currentRoute: string = '';
  private submittedIgcIdList: number[] = [];

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
  ) {
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
  navigateToViewIgcf(id: number) {
    this.router.navigate([
      'dashboard',
      { outlets: { dashboardContent: ['view-igcf', id] } },
    ]);
  }
  setSubmittedIgcIdList(idList: number[]) {
    this.submittedIgcIdList = idList;
  }
  getSubmittedIgcIdList(): number[] {
    return this.submittedIgcIdList;
  }

  
}
