import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
@Injectable({
  providedIn: 'root',
})
export class ToggleSideNavService {
  constructor() {}
  private isOpenSubject = new BehaviorSubject<boolean>(true);
  isOpen$ = this.isOpenSubject.asObservable();

  toggleDrawer(isOpen: boolean): void {
    this.isOpenSubject.next(isOpen);
  }

  // openDrawer() {
  //   this.isOpenSubject.next(true);
  // }

  // closeDrawer() {
  //   this.isOpenSubject.next(false);
  // }
}
