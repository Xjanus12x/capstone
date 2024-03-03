import { SelectionModel } from '@angular/cdk/collections';
import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { IUserList } from 'src/app/core/models/UsersList';
import { AuthService } from 'src/app/core/services/auth.service';
import { BackendService } from 'src/app/core/services/backend.service';
import { UpdateUserComponent } from '../../components/update-user/update-user.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent {
  constructor(
    private backendService: BackendService,
    private authService: AuthService,
    public dialog: MatDialog
  ) {}
  userList$!: Observable<IUserList[]>;
  dataToDisplay: IUserList[] = [];
  selection = new SelectionModel<any>(true, []);
  dataSource = new MatTableDataSource<any>();
  displayedHeader: string[] = [
    'Employee Number',
    'Employee Firstname',
    'Employee Lastname',
    'Employee Email',
    'User Role',
    'Employee Position',
    'Employee Department',
  ];
  displayedColumns: string[] = [
    'emp_number',
    'emp_firstname',
    'emp_lastname',
    'emp_email',
    'emp_role',
    'emp_position',
    'emp_dept',
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
        this.userList$ = this.backendService.getAllUsers(deptName);
        this.handleDataSubscription();
      },
    });
  }

  handleDataSubscription() {
    this.userList$.subscribe({
      next: (data: IUserList[]) => {
        this.dataToDisplay = data;
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
  updateUser(user: IUserList) {
    const dialogRef = this.dialog.open(UpdateUserComponent, {
      data: user,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      if (result.invalid) {
        this.authService.openSnackBar('Invalid inputs', 'Close', 'bottom');
        return;
      }
      const {
        emp_firstname,
        emp_lastname,
        emp_number,
        emp_role,
        emp_dept,
        emp_position,
      } = user;
      const orginalData = [
        emp_firstname,
        emp_lastname,
        emp_number,
        emp_role,
        emp_dept,
        emp_position,
      ];

      const updateData = [
        result.value.firstname,
        result.value.lastname,
        result.value.emp_number,
        result.value.role,
        result.value.dept,
        result.value.position,
      ];

      if (orginalData.join(',') === updateData.join(',')) {
        this.authService.openSnackBar('No changes made', 'Close', 'bottom');
        return;
      }
      this.authService.updateUserInformation({
        old_emp_number: emp_number,
        ...result.value,
      });
      this.authService.getUpdateStatus().subscribe({
        next: (status) => {
          if (status) {
            this.authService.openSnackBar(
              `User successfully updated`,
              'close',
              'bottom'
            );
            this.handleDataSubscription();
          }
        },
      });
    });
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
