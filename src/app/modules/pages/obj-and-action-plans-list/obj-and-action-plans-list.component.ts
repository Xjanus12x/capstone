import { SelectionModel } from '@angular/cdk/collections';
import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { BackendService } from 'src/app/core/services/backend.service';

@Component({
  selector: 'app-obj-and-action-plans-list',
  templateUrl: './obj-and-action-plans-list.component.html',
  styleUrls: ['./obj-and-action-plans-list.component.css'],
})
export class ObjAndActionPlansListComponent {
  constructor(
    private backendService: BackendService,
    private authService: AuthService,
    public dialog: MatDialog
  ) {}
  objAndActionPlans$!: Observable<any>;
  dataToDisplay: any[] = [];
  selection = new SelectionModel<any>(true, []);
  dataSource = new MatTableDataSource<any>();
  displayedHeader: string[] = [
    'KPI Title',
    'Action PLan',
    'Start Date',
    'Due Date',
    'Target',
    'Responsibles',
  ];
  displayedColumns: string[] = [
    'kpi_title',
    'action_plan',
    'start_date',
    'due_date',
    'target',
    'responsibles',
  ];
  isLoadingResults = true;
  currentUserEmpNumber: string = '';
  currentUserDept: string = '';
  targetsObj: any = {};
  targetYears: string[] = [];
  originalData: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.authService.getEmployeeDepartment().subscribe({
      next: (dept: string) => {
        this.currentUserDept = dept;
      },
    });
    this.loadData();
  }

  loadData() {
    this.isLoadingResults = true;
    this.objAndActionPlans$ = this.backendService.getKpisAndActionPlans(
      this.currentUserDept
    );
    this.handleDataSubscription();
  }

  handleDataSubscription() {
    this.objAndActionPlans$.subscribe({
      next: (data: any[]) => {
        if (data.length > 0) {
          this.targetYears = Object.keys(JSON.parse(data.at(0)['targets']));
          const modifiedData = data.map((data: any) => {
            return {
              ...data,
              target: JSON.parse(data.targets)[this.targetYears[0]],
            };
          });
          this.originalData = data;
          this.dataToDisplay = modifiedData;
          this.updateDataSource();
        }
      },
      error: (error) => {
        console.error('Error:', error);
        // Handle error here (e.g., display error message)
        this.isLoadingResults = false;
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

  deleteKPIAndActionPlan(id: number) {
    const indexToRemove = this.dataToDisplay.findIndex(
      (item: any) => item.id === id
    );
    if (indexToRemove === -1) return;
    // If the item is found, remove
    this.dataToDisplay.splice(indexToRemove, 1);
    this.dataSource.data = this.dataToDisplay;
    this.backendService.deleteKPIAndActionPlan(id).subscribe({
      next: () => {
        this.authService.openSnackBar(
          'KPI deleted successfully',
          'Close',
          'bottom'
        );
      },
    });
  }
  getYearTarget(targets: any, selectedYear: string) {
    console.log(targets);
    console.log(selectedYear);

    console.log(targets[selectedYear]);

    return targets[selectedYear];
  }
  // rejectUser(id: number) {
  //   const indexToRemove = this.dataToDisplay.findIndex(
  //     (item) => item.id === id
  //   );

  //   // If the item is found, remove it from the array
  //   if (indexToRemove === -1) return;
  //   this.backendService.deletePendingUser(id).subscribe({
  //     next: () => {
  //       this.dataToDisplay.splice(indexToRemove, 1);
  //       this.dataSource.data = this.dataToDisplay;
  //       this.authService.openSnackBar(
  //         'Row deleted successfully',
  //         'Close',
  //         'bottom'
  //       );
  //       // Optionally, update your component state or UI after deletion
  //     },
  //     error: (error) => {
  //       this.authService.openSnackBar(
  //         'Error deleting row: ' + error.message,
  //         'Close',
  //         'bottom'
  //       );
  //       // Optionally, handle the error or display an error message to the user
  //     },
  //   });
  // }
  // acceptUser(element: IPendingUser) {
  //   this.backendService.acceptPendingUser(element).subscribe({
  //     next: () => {
  //       this.authService.openSnackBar(
  //         'Pending user accepted successfully',
  //         'Close',
  //         'bottom'
  //       );
  //       const id = element.id;
  //       const indexToRemove = this.dataToDisplay.findIndex(
  //         (item) => item.id === id
  //       );
  //       // If the item is found, remove it from the array
  //       if (indexToRemove === -1) return;
  //       this.backendService.deletePendingUser(id!).subscribe({
  //         next: () => {
  //           this.dataToDisplay.splice(indexToRemove, 1);
  //           this.dataSource.data = this.dataToDisplay;
  //           this.updateDataSource();
  //         },
  //       });
  //     },
  //     error: (error) => this.handleError(error),
  //   });
  // }

  // updateUser(pendingUser: IPendingUser) {
  //   const dialogRef = this.dialog.open(UpdatePendingUserComponent, {
  //     data: pendingUser,
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (!result) return;
  //     if (result.invalid) {
  //       this.authService.openSnackBar('Invalid inputs', 'Close', 'bottom');
  //       return;
  //     }

  //     const orginalData = [
  //       pendingUser.emp_firstname,
  //       pendingUser.emp_lastname,
  //       pendingUser.emp_number,
  //       pendingUser.role,
  //       pendingUser.emp_dept,
  //       pendingUser.emp_position,
  //     ].join(',');

  //     const updateData = Object.values(result.value).join(',');

  //     if (orginalData === updateData) {
  //       this.authService.openSnackBar('No changes made', 'Close', 'bottom');
  //       return;
  //     }
  //     const id = pendingUser.id;
  //     const updatedPendingUserInfo = { id, ...result.value };

  //     this.backendService.updatePendingUser(updatedPendingUserInfo).subscribe({
  //       next: () => {
  //         this.authService.openSnackBar(
  //           `Pengind user successfully updated`,
  //           'close',
  //           'bottom'
  //         );
  //         this.handleDataSubscription();
  //       },
  //     });
  //   });
  // }

  filterSubmittedIgcf(year: string) {
    const modifiedData = this.originalData.map((data: any) => {
      return {
        ...data,
        target: JSON.parse(data.targets)[year],
      };
    });
    this.dataToDisplay = modifiedData;
    this.updateDataSource();
  }
}
