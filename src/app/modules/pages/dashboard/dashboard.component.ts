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
  submittedIgcfs$!: Observable<ISubmittedIGCF[]>;
  originalSubmittedIgcf!: ISubmittedIGCF[];
  dataToDisplay: ISubmittedIGCF[] = [];
  selection = new SelectionModel<ISubmittedIGCF>(true, []);
  dataSource = new MatTableDataSource<ISubmittedIGCF>();
  displayedHeader: string[] = [
    'Employee Number',
    'Full Name',
    'Employee Department',
    'Employee Position',
  ];
  displayedColumns: string[] = [
    'emp_number',
    'fullname',
    'emp_dept',
    'emp_position',
  ];
  userRole$!: Observable<string>;
  isLoadingResults = true;
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
    const result = this.originalSubmittedIgcf
      .map((item) => ({
        ...item,
        isSigned: item.ratee_signature.length > 0,
      }))

      .filter((igcf) => {
        const yearSigned = new Date(
          igcf.ratee_date_signed as string
        ).getFullYear();
        return yearSigned === selectedYear;
      });
    this.dataToDisplay = result;
    this.updateDataSource();
  }

  isRouteActive() {
    return (
      this.routerService.isRouteActive('submitted-form/:id/:isSigned') ||
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
              this.submittedIgcfs$ =
                this.backendService.getAllDeptSubmittedIgcf(deptName);
              this.handleDataSubscription(currentYear);
              this.isLoadingResults = false;
            },
            error: (error) => {
              this.handleError(error);
            },
          });
        } else if (role === 'Regular') {
          this.authService.getEmployeeNumber().subscribe({
            next: (empNumber) => {
              this.submittedIgcfs$ =
                this.backendService.getUserSubmittedIgcf(empNumber);
              this.handleDataSubscription(currentYear);
              this.isLoadingResults = false;
            },
            error: (error) => {
              this.handleError(error);
            },
          });
        } else {
          this.submittedIgcfs$ =
            this.backendService.getAllSubmittedIgcfInEverydept();
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
    this.submittedIgcfs$.subscribe({
      next: (data) => {
        this.originalSubmittedIgcf = data;
        this.deadlineYears = this.extractYears(this.originalSubmittedIgcf);
        const result = data
          .map((item) => ({
            ...item,
            isSigned: item.ratee_signature.length > 0,
          }))
          .filter((igcf) => {
            const yearSigned = new Date(
              igcf.ratee_date_signed as string
            ).getFullYear();
            return yearSigned === currentYear;
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
  }

  handleError(error: any) {
    console.error('Error:', error);
    // Handle error here (e.g., display error message)
  }

  deleteSubmittedIgcf(id: number) {
    const indexToRemove = this.dataToDisplay.findIndex(
      (item) => item.id === id
    );

    // // If the item is found, remove it from the array
    if (indexToRemove === -1) return;

    this.backendService.deleteSubmittedIgcf(id).subscribe({
      next: () => {
        this.dataToDisplay.splice(indexToRemove, 1);
        this.dataSource.data = this.dataToDisplay;
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

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource?.data.length;
    return numSelected === numRows;
  }

  extractYears(submittedIgcf: ISubmittedIGCF[]): number[] {
    const years: number[] = [];

    // Populate years array
    submittedIgcf.forEach((igcf) => {
      const rateeDateSigned = new Date(igcf.ratee_date_signed);
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
