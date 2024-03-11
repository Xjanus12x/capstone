import { Component, OnInit } from '@angular/core';
import { ToggleSideNavService } from '../../services/toggle-side-nav.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CalendarComponent } from '../calendar/calendar.component';
import { AuthService } from '../../services/auth.service';
import { BackendService } from '../../services/backend.service';
import { DatePipe } from '@angular/common';
import { ProfilePageComponent } from '../profile-page/profile-page.component';
import { RouterService } from 'src/app/modules/services/router-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  providers: [DatePipe],
})
export class HeaderComponent implements OnInit {
  constructor(
    private sideNav: ToggleSideNavService,
    public dialog: MatDialog,
    private authService: AuthService,
    private backendService: BackendService,
    private datePipe: DatePipe,
    private routerService: RouterService
  ) {}
  isClick: boolean = true;
  isNotified: boolean = false;
  role: string = '';
  dept: string = '';
  deadline!: Date | undefined;
  toggleSideNav() {
    this.isClick = !this.isClick;
    this.sideNav.toggleDrawer(this.isClick);
  }

  ngOnInit(): void {
    this.authService.getUserRole().subscribe({
      next: (role: string) => {
        this.role = role;
      },
    });
    this.authService.getEmployeeDepartment().subscribe({
      next: (dept: string) => {
        this.dept = dept;
      },
    });
  }
  // '2024-02-26T16:00:00.000Z';

  handleDateClick() {
    const dialogRef: MatDialogRef<CalendarComponent, any> = this.dialog.open(
      CalendarComponent,
      {
        width: '500px',
        data: { role: this.role },
      }
    );
    if (this.role === 'Admin') {
      dialogRef.afterClosed().subscribe((selectedDate: Date | undefined) => {
        if (selectedDate) {
          const deadline = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
          // Do something with the selectedDate
          this.backendService.setIgcfDeadline({
            dept: this.dept,
            date: deadline!,
          });
        } else {
          // User closed the dialog without selecting a date
          console.log('Dialog closed without selecting a date');
        }
      });
    }
  }
  openProfile(): void {
    const dialogRef = this.dialog.open(ProfilePageComponent, {
      width: '1200px', // Set the desired width here
    });

    // You can optionally subscribe to the afterClosed() event to perform actions after the dialog is closed
    dialogRef.afterClosed().subscribe((result) => {
      // Handle the result if needed
    });
  }
  logout(): void {
    this.authService.logoutUser();
    this.routerService.routeTo('login');
  }
}
