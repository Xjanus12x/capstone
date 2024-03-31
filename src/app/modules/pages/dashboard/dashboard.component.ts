import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RouterService } from '../../services/router-service.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { BackendService } from 'src/app/core/services/backend.service';
import { Observable, Subject, filter, takeUntil } from 'rxjs';
import { ISubmittedIGCF } from 'src/app/core/models/SubmittedIgcf';
import { AuthService } from 'src/app/core/services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  submissionHistory$!: Observable<any>;
  originalSubmissionHistory: any[] = [];
  dataToDisplay: any[] = [];
  selection = new SelectionModel<any>(true, []);
  dataSource = new MatTableDataSource<any>();
  displayedHeader: string[] = [
    'Fullname',
    'Employee Number',
    'Position',
    'Department',
    'Completion Date',
    'Rated On',
  ];
  displayedColumns: string[] = [
    'fullname',
    'emp_number',
    'position',
    'department',
    'completion_date',
    'rate_date',
  ];
  currentUserRole: string = '';
  isLoading = false;
  deadlineYears: any[] = [];
  submittedIgcfIdList: number[] = [];
  rolesMap: Map<string, string> = new Map<string, string>([
    ['Chair', ''],
    ['Admin', 'department'],
    ['Faculty', 'emp_number'],
    ['HRD', ''],
    ['College Secretary', ''],
  ]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  // Create a Subject to handle unsubscribing
  private unsubscribe$ = new Subject<void>();
  constructor(
    private routerService: RouterService,
    private backendService: BackendService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // this.userRole$ = this.authService.getUserRole();
    this.currentUserRole = this.authService.getUserInformationFirebase().role;

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

  ngOnDestroy(): void {
    // Unsubscribe from observables to prevent memory leaks
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  filterSubmittedIgcf(filterType: string) {
    // Convert date to number
    const selectedYear = Number(filterType);
    if (isNaN(selectedYear)) {
      this.dataSource.data = this.originalSubmissionHistory;
      return;
    }

    // console.log(this.dataToDisplay);
    const result = this.originalSubmissionHistory.filter(
      (submissionHistory) => {
        const yearSigned = new Date(
          submissionHistory.completion_date
        ).getFullYear();
        return yearSigned === selectedYear;
      }
    );
    this.dataSource.data = result;
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
    this.isLoading = true;
    const currentYear = new Date().getFullYear();
    const { department, role, emp_number } =
      this.authService.getUserInformationFirebase();

    const toSearch: string = role === 'Admin' ? department : emp_number;
    this.backendService
      .getSubmittedIGCFsFirebase(role, this.rolesMap.get(role)!, toSearch)
      .subscribe({
        next: (submittedIGCFs: any[]) => {
          this.checkYearOfCompletions(role, emp_number, submittedIGCFs);
          const submissionHistory: any[] = submittedIGCFs.map(
            (submittedIGC: any) => {
              const {
                id,
                fullname,
                emp_number,
                position,
                department,
                completion_date,
                rate_date,
              } = submittedIGC;
              return {
                id,
                fullname,
                emp_number,
                position,
                department,
                completion_date,
                rate_date,
              };
            }
          );

          if (this.currentUserRole === 'Admin')
            this.handleSubmittedIGCFs(submissionHistory, currentYear, role);
          else if (this.currentUserRole === 'Faculty')
            this.handleSubmittedIGCFs(submissionHistory, currentYear, role);
          else if (this.currentUserRole === 'HRD')
            this.handleSubmittedIGCFs(submissionHistory, currentYear, role);
        },
        error: (e) => {},
        complete: () => {
          this.isLoading = false;
        },
      });

    // else if (this.currentUserRole === 'Faculty') {
    //   this.authService.getEmployeeNumber().subscribe({
    //     next: (empNumber) => {
    //       this.submissionHistory$ =
    //         this.backendService.getSubmissionHistoryByEmployeeNumber(empNumber);
    //       this.handleDataSubscription(currentYear);
    //       this.isLoading = false;
    //     },
    //     error: (error) => {
    //       this.handleError(error);
    //     },
    //   });
    // } else if (this.currentUserRole === 'HRD') {
    //   this.submissionHistory$ =
    //     this.backendService.getSubmissionHistoryEveryDept();
    //   this.handleDataSubscription(currentYear);
    //   this.isLoading = false;
    // }
  }

  checkYearOfCompletions(
    role: string,
    employeeNumber: string,
    submittedIGCFs: any[]
  ) {
    // this.backendService
    //   .getSubmittedIGCFsFirebase(role, 'emp_number', employeeNumber)
    //   .subscribe({
    //     next: (submittedIGCFs: any[]) => {
    //       submittedIGCFs.forEach((submittedIGCF: any) => {
    //         const completionYear = new Date(submittedIGCF.completion_date)
    //           .getFullYear()
    //           .toString();
    //         this.backendService.setYearOfCompletions(completionYear);
    //       });
    //     },
    //   });
    submittedIGCFs.forEach((submittedIGCF: any) => {
      const completionYear = new Date(submittedIGCF.completion_date)
        .getFullYear()
        .toString();
      this.backendService.setYearOfCompletions(completionYear);
    });    
  }

  handleSubmittedIGCFs(data: any[], currentYear: number, role: string) {
    const modifiedData = this.modifySubmissionHistoryData(data);
    const getCurrentYearIGCFs = this.getCurrentYearOfIGCFs(
      modifiedData,
      currentYear
    );
    this.deadlineYears = this.extractYears(modifiedData);
    this.originalSubmissionHistory = modifiedData;
    if (role === 'Admin' || role === 'HRD')
      this.dataSource.data = getCurrentYearIGCFs;
    else if (role === 'Faculty') this.dataSource.data = modifiedData;
    this.setupPaginatorAndSort();
  }

  modifySubmissionHistoryData(submissionHistory: any[]) {
    return submissionHistory.map((submissionDetails: any) => {
      return {
        ...submissionDetails,
        rating_status: !!submissionDetails.rate_date ? 'Done' : 'Pending',
      };
    });
  }

  getCurrentYearOfIGCFs(submittedIGCFs: any[], currentYear: number) {
    return submittedIGCFs.filter((submissionDetails: any) => {
      const yearOfCompletion = new Date(
        submissionDetails.completion_date
      ).getFullYear();
      return yearOfCompletion === currentYear;
    });
  }

  // handleDataSubscription(currentYear: number) {
  //   this.submissionHistory$.subscribe({
  //     next: (data) => {
  //       const modifiedData = data.map((submissionDetails: any) => {
  //         this.submittedIgcfIdList.push(submissionDetails.id);
  //         return {
  //           ...submissionDetails,
  //           rating_status: !!submissionDetails.rate_date ? 'Done' : 'Pending',
  //         };
  //       });
  //       this.deadlineYears = this.extractYears(modifiedData);
  //       this.originalSubmissionHistory = modifiedData;
  //       const result = modifiedData.filter((submissionDetails: any) => {
  //         const yearOfCompletion = new Date(
  //           submissionDetails.completion_date
  //         ).getFullYear();
  //         return yearOfCompletion === currentYear;
  //       });
  //       this.routerService.setSubmittedIgcIdList(
  //         Array.from(new Set(this.submittedIgcfIdList))
  //       );
  //       this.dataToDisplay = result;
  //       this.updateDataSource();
  //     },
  //     error: (error) => {
  //       this.handleError(error);
  //     },
  //   });
  // }
  // handleDataSubscription(currentYear: number) {
  //   this.submissionHistory$
  //     .pipe(takeUntil(this.unsubscribe$)) // Unsubscribe when component is destroyed
  //     .subscribe({
  //       next: (data) => {
  //         const modifiedData = data.map((submissionDetails: any) => {
  //           this.submittedIgcfIdList.push(submissionDetails.id);
  //           return {
  //             ...submissionDetails,
  //             rating_status: !!submissionDetails.rate_date ? 'Done' : 'Pending',
  //           };
  //         });
  //         this.deadlineYears = this.extractYears(modifiedData);
  //         this.originalSubmissionHistory = modifiedData;
  //         const result = modifiedData.filter((submissionDetails: any) => {
  //           const yearOfCompletion = new Date(
  //             submissionDetails.completion_date
  //           ).getFullYear();
  //           return yearOfCompletion === currentYear;
  //         });
  //         this.routerService.setSubmittedIgcIdList(
  //           Array.from(new Set(this.submittedIgcfIdList))
  //         );
  //         this.dataToDisplay = result;
  //         this.updateDataSource();
  //       },
  //       error: (error) => {
  //         this.handleError(error);
  //       },
  //     });
  // }
  setupPaginatorAndSort() {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator; // Set paginator after data is loaded
      this.dataSource.sort = this.sort;
      this.isLoading = false;
    }, 0);
  }

  handleError(error: any) {
    console.error('Error:', error);
    // Handle error here (e.g., display error message)
  }

  deleteSubmittedIgcf(id: number) {
    this.isLoading = true;
    const indexToRemove = this.dataToDisplay.findIndex(
      (item) => item.id === id
    );

    // // If the item is found, remove it from the array
    if (indexToRemove === -1) return;
    this.backendService.deleteSubmittedIgcf(id).subscribe({
      next: () => {
        this.dataToDisplay.splice(indexToRemove, 1);
        this.dataSource.data = this.dataToDisplay;
        this.isLoading = false;
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
