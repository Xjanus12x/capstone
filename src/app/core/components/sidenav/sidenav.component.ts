import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ViewChild,
} from '@angular/core';
import { ToggleSideNavService } from '../../services/toggle-side-nav.service';
import { Router } from '@angular/router';
import { NavItem } from '../../models/NavItems';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
})
export class SidenavComponent {
  @ViewChild('drawer') drawer!: any;
  isOpen!: boolean;
  constructor(
    private sideNav: ToggleSideNavService,
    private authService: AuthService
  ) {
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
      label: 'Manage Users',
      children: [
        {
          label: 'View Pending Users',
          link: 'pending-user-list',
          outlet: 'dashboardContent',
          canAccess: ['Admin', 'College Secretary'],
        },
        {
          label: 'View All Users',
          link: 'user-list',
          outlet: 'dashboardContent',
          canAccess: ['Admin', 'College Secretary'],
        },
      ],
      collapsed: true,
      canAccess: ['Admin', 'College Secretary'],
    },
    {
      label: 'Manage Form',
      children: [
        {
          label: 'Fill Out IGC Form',
          link: 'fill-up',
          outlet: 'dashboardContent',
          canAccess: ['Faculty', 'Admin'],
        },
      ],
      collapsed: true,
      canAccess: ['Faculty', 'Admin'],
    },

    {
      label: 'Manage Objectives',
      children: [
        {
          label: 'Create Objectives',
          link: 'create-objectives',
          outlet: 'dashboardContent',
          canAccess: ['Admin', 'College Secretary'],
        },
        {
          label: 'View Objectives List',
          link: 'obj-and-action-plan-list',
          outlet: 'dashboardContent',
          canAccess: ['Admin', 'College Secretary'],
        },
      ],
      collapsed: true,
      canAccess: ['Admin', 'College Secretary'],
    },

    {
      label: 'Reports',
      outlet: 'dashboardContent',
      link: 'reports',
      canAccess: ['Admin', 'HRD'],
    },
    {
      label: 'View Logs',
      outlet: 'dashboardContent',
      link: 'logs',
      canAccess: ['Admin'],
    },
  ];
}
