import { Component, ElementRef, ViewChild } from '@angular/core';
import { ToggleSideNavService } from '../../services/toggle-side-nav.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
})
export class SidenavComponent {
  @ViewChild('drawer') drawer!: any;

  constructor(private sideNav: ToggleSideNavService) {}
  ngAfterViewInit() {
    this.sideNav.isOpen$.subscribe((isOpen) => {
      if (isOpen) {
        this.drawer.open();
      } else {
        this.drawer.close()
        
      }
    });
  }
}
