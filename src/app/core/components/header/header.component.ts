import { Component } from '@angular/core';
import { ToggleSideNavService } from '../../services/toggle-side-nav.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  constructor(private sideNav: ToggleSideNavService) {}
  isClick: boolean = false;
  isNotified: boolean = false;
  toggleSideNav() {
    this.isClick = !this.isClick;
    if (this.isClick) {
      this.sideNav.openDrawer();
    } else {
      this.sideNav.closeDrawer();
    }
  }
  toggleNotification() {
    this.isNotified = !this.isNotified;
  }
}
