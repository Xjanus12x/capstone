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
    'Target',
    'Time Frame',
    'Responsible',
  ];

  // action_plan: 'j212112';
  // id: 22;
  // kpi_title: '11111';
  // responsible: 'Organizations,Lab';
  // target: '34 (03-21-2024 to 04-20-2024)';
  // timeframe: '03-21-2024 - 04-20-2024';
  displayedColumns: string[] = [
    'kpi_title',
    'action_plan',
    'target',
    'timeframe',
    'responsible',
  ];
  isLoadingResults = true;
  currentUserEmpNumber: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadData();
  }
  // action_plan_id: 1;
  // action_plan_weight_percentage: '2';
  // dept: 'SCHOOL OF COMPUTING';
  // dept_obj_title: 'wared';
  // kpi_id: 9;
  // kpi_title: 'testst';
  // kpi_weight_percentage: 32;

  loadData() {
    this.isLoadingResults = true;
    this.objAndActionPlans$ = this.backendService.getKpisAndActionPlans();
    this.handleDataSubscription();
  }

  handleDataSubscription() {
    this.objAndActionPlans$.subscribe({
      next: (data: any) => {
        console.log(data);

        this.dataToDisplay = data;
        this.updateDataSource();
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
}
