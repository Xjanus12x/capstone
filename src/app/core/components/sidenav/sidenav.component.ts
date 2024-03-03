import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ViewChild,
} from '@angular/core';
import { ToggleSideNavService } from '../../services/toggle-side-nav.service';
import { Router } from '@angular/router';
import { NavItem } from '../../models/NavItems';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
})
export class SidenavComponent {
  @ViewChild('drawer') drawer!: any;
  isOpen!: boolean;
  constructor(private sideNav: ToggleSideNavService) {
    // this.dataSource.data = this.TREE_DATA;
  }
  ngOnInit() {
    this.sideNav.isOpen$.subscribe((isOpen) => {
      this.isOpen = isOpen;
    });
  }
  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      link: '/dashboard',
    },
    {
      label: 'User',
      children: [
        {
          label: 'Register User',
          link: '/register',
        },
        {
          label: 'User List',
          link: 'user-list',
          outlet: 'dashboardContent',
        },
      ],
      collapsed: true, // Set collapsed to true by default
      canAccess: ['Admin'],
    },
    {
      label: 'Form',
      children: [
        {
          label: 'Fill Up',
          link: 'fill-up',
          outlet: 'dashboardContent',
          canAccess: ['Regular'],
        },
        {
          label: 'Set Percentages',
          link: 'set-percentages',
          outlet: 'dashboardContent',
          canAccess: ['Admin'],
        },
        {
          label: 'Percentages List',
          link: 'percentages-list',
          outlet: 'dashboardContent',
          canAccess: ['Admin'],
        },
      ],
      collapsed: true, // Set collapsed to true by default
      canAccess: ['Admin', 'Regular'],
    },
    {
      label: 'Reports',
      outlet: 'dashboardContent',
      link: 'reports',
      canAccess: ['Admin', 'Viewer Only'],
    },
  ];
}
