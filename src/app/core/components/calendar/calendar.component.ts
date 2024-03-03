import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private backendService: BackendService
  ) {}
  currentDate: any = new Date();
  // selectedDate: Date = new Date('2024-02-26T16:00:00.000Z'); // Initialize with today's date
  selectedDate: Date | null = null;
  role: string = '';
  ngOnInit(): void {
    this.authService.getEmployeeDepartment().subscribe({
      next: (dept: string) => {
        this.backendService.getIgcfDeadline(dept).subscribe({
          next: (deadline) => {
            const result = Object.values(deadline);
            if (result.length > 0) {
              this.selectedDate = new Date(result[0]);
            } else {
              this.selectedDate = new Date();
            }
          },
        });
      },
    });
    this.role = this.data.role;
  }
  onDateSelected(date: Date) {
    this.selectedDate = date;
  }
}
