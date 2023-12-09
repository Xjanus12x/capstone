import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ViewChild,
} from '@angular/core';
import { ToggleSideNavService } from '../../services/toggle-side-nav.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
})
export class SidenavComponent implements AfterViewInit {
  @ViewChild('drawer') drawer!: any;

  constructor(
    private sideNav: ToggleSideNavService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.sideNav.isOpen$.subscribe((isOpen) => {
      if (isOpen) {
        this.drawer.open();
      } else {
        this.drawer.close();
      }
      // Manually trigger change detection to prevent expressionChangeAfterItHasBeenCheckError
      this.cdr.detectChanges();
    });
  }
}
