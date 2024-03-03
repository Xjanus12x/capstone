import { Component, OnInit } from '@angular/core';
import { ToggleSideNavService } from '../../services/toggle-side-nav.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CalendarComponent } from '../calendar/calendar.component';
import { AuthService } from '../../services/auth.service';
import { BackendService } from '../../services/backend.service';
import { DatePipe } from '@angular/common';

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
    private datePipe: DatePipe
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
  toggleNotification() {
    this.isNotified = !this.isNotified;
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
}
