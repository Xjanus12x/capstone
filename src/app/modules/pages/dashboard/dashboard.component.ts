import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterService } from '../../services/router-service.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { BackendService } from 'src/app/core/services/backend.service';
import { Observable, filter } from 'rxjs';
import { ISubmittedIGCF } from 'src/app/core/models/SubmittedIgcf';
import { AuthService } from 'src/app/core/services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  submissionHistory$!: Observable<any>;
  originalSubmissionHistory!: any[];
  dataToDisplay: any[] = [];
  selection = new SelectionModel<any>(true, []);
  dataSource = new MatTableDataSource<any>();
  displayedHeader: string[] = [
    'Fullname',
    'Employee Number',
    'Position',
    'Department',
    'Completion Date',
  ];
  displayedColumns: string[] = [
    'fullname',
    'emp_number',
    'emp_position',
    'emp_dept',
    'completion_date',
  ];
  userRole$!: Observable<string>;
  isLoadingResults = false;
  deadlineYears: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(
    private routerService: RouterService,
    private backendService: BackendService,
    private authService: AuthService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.userRole$ = this.authService.getUserRole();
    this.loadData();

    // Subscribe to router events
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        // Check if navigation is back to the dashboard
        if (this.router.url === '/dashboard') {
          this.loadData(); // Reload data if navigating back to the dashboard
          // console.log("dashboard");
        }
      });
  }

  filterSubmittedIgcf(date: string) {
    // Convert date to number
    const selectedYear = Number(date);

    // console.log(this.dataToDisplay);
    const result = this.originalSubmissionHistory.filter(
      (submissionHistory) => {
        const yearSigned = new Date(
          submissionHistory.completion_date
        ).getFullYear();
        return yearSigned === selectedYear;
      }
    );
    this.dataToDisplay = result;
    this.updateDataSource();
  }

  isRouteActive() {
    return (
      this.routerService.isRouteActive('submitted-form/:id') ||
      this.routerService.isRouteActive('set-percentages') ||
      this.routerService.isRouteActive('fill-up') ||
      this.routerService.isRouteActive('view-igcf/:id') ||
      this.routerService.isRouteActive('user-list') ||
      this.routerService.isRouteActive('reports') ||
      this.routerService.isRouteActive('percentages-list') ||
      this.routerService.isRouteActive('pending-user-list') ||
      this.routerService.isRouteActive('input-kpis') ||
      this.routerService.isRouteActive('action-plans') ||
      this.routerService.isRouteActive('obj-and-action-plan-list')
    );
  }

  loadData() {
    const currentYear = new Date().getFullYear();
    this.authService.getUserRole().subscribe({
      next: (role) => {
        this.isLoadingResults = true;
        if (role === 'Admin') {
          this.authService.getEmployeeDepartment().subscribe({
            next: (deptName) => {
              this.submissionHistory$ =
                this.backendService.getSubmissionHistoryByDept(deptName);
              this.handleDataSubscription(currentYear);
            },
            error: (error) => {
              this.handleError(error);
            },
          });
        } else if (role === 'Faculty') {
          this.authService.getEmployeeNumber().subscribe({
            next: (empNumber) => {
              this.submissionHistory$ =
                this.backendService.getSubmissionHistoryByEmployeeNumber(
                  empNumber
                );
              this.handleDataSubscription(currentYear);
              this.isLoadingResults = false;
            },
            error: (error) => {
              this.handleError(error);
            },
          });
        } else {
          this.submissionHistory$ =
            this.backendService.getSubmissionHistoryEveryDept();
          this.handleDataSubscription(currentYear);
          this.isLoadingResults = false;
        }
      },
      error: (error) => {
        this.handleError(error);
      },
    });
  }

  handleDataSubscription(currentYear: number) {
    this.submissionHistory$.subscribe({
      next: (data) => {
        this.originalSubmissionHistory = data;
        this.deadlineYears = this.extractYears(this.originalSubmissionHistory);
        const result = data.filter((submissionDetails: any) => {
          const yearOfCompletion = new Date(
            submissionDetails.completion_date
          ).getFullYear();
          return yearOfCompletion === currentYear;
        });

        this.dataToDisplay = result;
        this.updateDataSource();
      },
      error: (error) => {
        this.handleError(error);
      },
    });
  }

  updateDataSource() {
    this.dataSource = new MatTableDataSource(this.dataToDisplay);
    this.dataSource.paginator = this.paginator; // Set paginator after data is loaded
    this.dataSource.sort = this.sort;
    this.isLoadingResults = false;
  }

  handleError(error: any) {
    console.error('Error:', error);
    // Handle error here (e.g., display error message)
  }

  deleteSubmittedIgcf(id: number) {
    this.isLoadingResults = true;
    const indexToRemove = this.dataToDisplay.findIndex(
      (item) => item.id === id
    );

    // // If the item is found, remove it from the array
    if (indexToRemove === -1) return;
    this.backendService.deleteSubmittedIgcf(id).subscribe({
      next: () => {
        this.dataToDisplay.splice(indexToRemove, 1);
        this.dataSource.data = this.dataToDisplay;
        this.isLoadingResults = false;
        this.authService.openSnackBar(
          'Row deleted successfully',
          'Close',
          'bottom'
        );
        // Optionally, update your component state or UI after deletion
      },
      error: (error) => {
        this.authService.openSnackBar(
          'Error deleting row: ' + error.message,
          'Close',
          'bottom'
        );

        // Optionally, handle the error or display an error message to the user
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  concatColumns(...additionalColumns: string[]) {
    return this.displayedColumns.concat(additionalColumns);
  }

  extractYears(submissionHistory: any[]): number[] {
    const years: number[] = [];
    // Populate years array
    submissionHistory.forEach((submission) => {
      const rateeDateSigned = new Date(submission.completion_date);
      const year = rateeDateSigned.getFullYear();
      if (!isNaN(year) && !years.includes(year)) {
        years.push(year);
      }
    });

    // Sort years array
    years.sort((a, b) => a - b);

    return years;
  }
}
