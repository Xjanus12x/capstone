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
import { Observable, Subject, Subscription, filter, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../../components/dialog-box/dialog-box.component';
import { IDialogBox } from 'src/app/core/models/DialogBox';
import { dialogBoxConfig } from 'src/app/core/constants/DialogBoxConfig';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [DatePipe],
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
    // 'Position',
    'Department',
    'Completion Date',
    'Rated On',
    'Overall Average Rating',
  ];
  displayedColumns: string[] = [
    'fullname',
    'emp_number',
    // 'position',
    'department',
    'completion_date',
    'rate_date',
    'overall_weighted_average_rating',
  ];
  currentUserRole: string = '';
  isLoading = false;
  deadlineYears: any[] = [];
  submittedIgcfIdList: number[] = [];
  private deleteSubscription: Subscription | undefined;

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
    private datePipe: DatePipe,
    private dialog: MatDialog
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

    if (this.deleteSubscription) {
      this.deleteSubscription.unsubscribe();
    }
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
      this.routerService.isRouteActive('create-objectives') ||
      this.routerService.isRouteActive('action-plans') ||
      this.routerService.isRouteActive('obj-and-action-plan-list') ||
      this.routerService.isRouteActive('logs')
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
          this.checkYearOfCompletions(emp_number, submittedIGCFs);
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
                overall_weighted_average_rating,
              } = submittedIGC;
              return {
                id,
                fullname,
                emp_number,
                position,
                department,
                completion_date,
                rate_date,
                overall_weighted_average_rating,
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
  }

  checkYearOfCompletions(employeeNumber: string, submittedIGCFs: any[]) {
    const currentUserSubmittedIGCFs = submittedIGCFs.filter(
      (igcf) => igcf.emp_number === employeeNumber
    );
    const currentUserIGCFYearOfCompletionsSet = new Set(
      currentUserSubmittedIGCFs.map((submittedIGCF: any) =>
        new Date(submittedIGCF.completion_date).getFullYear().toString()
      )
    );

    // Convert the Set back to an array if needed
    const currentUserIGCFYearOfCompletions = Array.from(
      currentUserIGCFYearOfCompletionsSet
    );

    this.backendService.setYearOfCompletions(currentUserIGCFYearOfCompletions);
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

  deleteSubmittedIgcf(id: string, element: any) {
    // Open confirmation dialog
    const dialogBoxData: IDialogBox = {
      title: 'Confirm Deletion',
      content:
        'Are you sure you want to delete this item? This action cannot be undone.',
      buttons: [
        {
          isVisible: true,
          matDialogCloseValue: false,
          content: 'No',
        },
        {
          isVisible: true,
          matDialogCloseValue: true,
          content: 'Yes, Confirm Deletion',
        },
      ],
    };

    const dialogRef = this.dialog.open(DialogBoxComponent, {
      ...dialogBoxConfig,
      data: dialogBoxData,
    });

    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          const indexToRemove = this.dataToDisplay.findIndex(
            (item) => item.id === id
          );
          let msg: string = '';
          this.deleteSubscription = this.backendService
            .deleteSubmittedIGCFByID(id)
            .subscribe({
              next: () => {
                msg = 'IGCF deleted successfully';
                this.dataToDisplay.splice(indexToRemove, 1);
                this.dataSource.data = this.dataToDisplay;
              },
              error: (err) => {
                msg = 'Error deleting IGCF';
              },
              complete: () => {
                this.authService.openSnackBar(msg, 'Close', 'bottom');
                this.loadData();
                const { firstname, lastname, role, department } =
                  this.authService.getUserInformationFirebase();
                const fullname = `${firstname} ${lastname}`.toUpperCase();
                const deletionDate = this.datePipe.transform(
                  new Date(),
                  'yyyy-MM-dd'
                );
                let message = '';
                if (role === 'Admin')
                  message = `${fullname} has deleted an Individual Goal Commitment Form (IGCF) submitted by ${element.fullname} on ${element.completion_date}`;
                else if (role === 'Faculty')
                  message = `${fullname} has deleted their own Individual Goal Commitment Form (IGCF) submitted on ${element.completion_date}.`;

                this.backendService.addLog({
                  message,
                  timestamp: deletionDate,
                  department: department,
                  type: 'deleted-igc',
                });
              },
            });
        }
      },
    });

    // If the item is found, remove it from the array

    // this.backendService.deleteSubmittedIgcf(id).subscribe({
    //   next: () => {
    //     this.dataToDisplay.splice(indexToRemove, 1);
    //     this.dataSource.data = this.dataToDisplay;
    //     this.isLoading = false;
    //     this.authService.openSnackBar(
    //       'Row deleted successfully',
    //       'Close',
    //       'bottom'
    //     );
    //     // Optionally, update your component state or UI after deletion
    //   },
    //   error: (error) => {
    //     this.authService.openSnackBar(
    //       'Error deleting row: ' + error.message,
    //       'Close',
    //       'bottom'
    //     );

    //     // Optionally, handle the error or display an error message to the user
    //   },
    // });
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
