import { SelectionModel } from '@angular/cdk/collections';
import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { BackendService } from 'src/app/core/services/backend.service';
import { UpdateUserComponent } from '../../components/update-user/update-user.component';
import { IPercentagesList } from 'src/app/core/models/PercentagesList';

@Component({
  selector: 'app-percentages-list',
  templateUrl: './percentages-list.component.html',
  styleUrls: ['./percentages-list.component.css'],
})
export class PercentagesListComponent {
  constructor(
    private backendService: BackendService,
    private authService: AuthService,
    public dialog: MatDialog
  ) {}
  percentagesList$!: Observable<IPercentagesList[]>;
  dataToDisplay: IPercentagesList[] = [];
  selection = new SelectionModel<any>(true, []);
  dataSource = new MatTableDataSource<any>();
  displayedHeader: string[] = [
    'Title',
    'Accomplishment %',
    'Individual Goal Commitment %',
    'Set Weight %',
  ];
  //   dept_name
  // :
  // "SCHOOL OF COMPUTING"
  // id
  // :
  // 27
  // set_accomplishment_%
  // :
  // "324234,423243,342234,243234,432"
  // set_individual_goal_commitment_%
  // :
  // "2424,432423,342432,324423,423234"
  // set_weight_%
  // :
  // "234,432,243432,234234,2344"
  // title
  // :
  // "helloworld"
  //   interface DepartmentInfo {
  //     id: number;
  //     dept_name: string;
  //     title: string;
  //     set_accomplishment_?: string;
  //     set_individual_goal_commitment_?: string;
  //     set_weight_?: string;
  // }
  displayedColumns: string[] = [
    'title',
    'set_accomplishment_%',
    'set_individual_goal_commitment_%',
    'set_weight_%',
  ];
  userRole$!: Observable<string>;
  isLoadingResults = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.userRole$ = this.authService.getUserRole();
    this.loadData();
  }

  loadData() {
    this.isLoadingResults = true;
    this.authService.getEmployeeDepartment().subscribe({
      next: (deptName) => {
        this.percentagesList$ =
          this.backendService.getIgcfPercentages(deptName);
        this.handleDataSubscription();
      },
    });
  }

  handleDataSubscription() {
    this.percentagesList$.subscribe({
      next: (data: IPercentagesList[]) => {
        this.dataToDisplay = data.map((percentage: any) => {
          console.log(percentage['set_weight_%']); // Accessing property using bracket notation
          const weights: any = percentage['set_weight_%']
          

          // Creating a new object with a computed property name
          return {
            ...percentage,
            'set_weight_%': weights, // Copying the property with a computed property name
          };
        });
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

  // deleteSubmittedIgcf(id: number) {
  //   const indexToRemove = this.dataToDisplay.findIndex(
  //     (item) => item.id === id
  //   );

  //   // // If the item is found, remove it from the array
  //   if (indexToRemove === -1) return;

  //   this.backendService.deleteSubmittedIgcf(id).subscribe({
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
  updateUser(user: IPercentagesList) {
    const dialogRef = this.dialog.open(UpdateUserComponent, {
      data: user,
    });

    // dialogRef.afterClosed().subscribe((result) => {
    //   if (!result) return;
    //   if (result.invalid) {
    //     this.authService.openSnackBar('Invalid inputs', 'Close', 'bottom');
    //     return;
    //   }
    //   const {
    //     emp_firstname,
    //     emp_lastname,
    //     emp_number,
    //     emp_role,
    //     emp_dept,
    //     emp_position,
    //   } = user;
    //   const orginalData = [
    //     emp_firstname,
    //     emp_lastname,
    //     emp_number,
    //     emp_role,
    //     emp_dept,
    //     emp_position,
    //   ];

    //   const updateData = [
    //     result.value.firstname,
    //     result.value.lastname,
    //     result.value.emp_number,
    //     result.value.role,
    //     result.value.dept,
    //     result.value.position,
    //   ];

    //   if (orginalData.join(',') === updateData.join(',')) {
    //     this.authService.openSnackBar('No changes made', 'Close', 'bottom');
    //     return;
    //   }
    //   this.authService.updateUserInformation({
    //     old_emp_number: emp_number,
    //     ...result.value,
    //   });
    //   this.authService.getUpdateStatus().subscribe({
    //     next: (status) => {
    //       if (status) {
    //         this.authService.openSnackBar(
    //           `User successfully updated`,
    //           'close',
    //           'bottom'
    //         );
    //         // this.handleDataSubscription();
    //       }
    //     },
    //   });
    // });
  }

  deleteUser(id: number) {
    // const indexToRemove = this.dataToDisplay.findIndex(
    //   (item) => item.id === id
    // );
    // // // If the item is found, remove it from the array
    // if (indexToRemove === -1) return;
    // this.backendService.deleteSubmittedIgcf(id).subscribe({
    //   next: () => {
    //     this.dataToDisplay.splice(indexToRemove, 1);
    //     this.dataSource.data = this.dataToDisplay;
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
}
