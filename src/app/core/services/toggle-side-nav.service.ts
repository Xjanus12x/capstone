import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
@Injectable({
  providedIn: 'root',
})
export class ToggleSideNavService {
  constructor() {}
  private isOpenSubject = new BehaviorSubject<boolean>(false);

  isOpen$ = this.isOpenSubject.asObservable();

  openDrawer() {
    this.isOpenSubject.next(true);
  }

  closeDrawer() {
    this.isOpenSubject.next(false);
   
  }
}
