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
    'Firstname',
    'Lastname',
    'Email',
    'User Role',
    'Position',
    'Department',
  ];
  displayedColumns: string[] = [
    'emp_number',
    'firstname',
    'lastname',
    'email',
    'role',
    'position',
    'department',
  ];
  userRole$!: Observable<string>;
  isLoading = true;
  currentUserEmpNumber: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  currentUserDepartment: string = '';

  ngOnInit(): void {
    // this.userRole$ = this.authService.getUserRole();
    // this.loadData();
    this.isLoading = true;
    this.currentUserDepartment =
      this.authService.getUserInformationFirebase().department;
    this.backendService.getUsersFirebase(this.currentUserDepartment).subscribe({
      next: (users: any[]) => {
        this.dataToDisplay = users.filter(
          (user) =>
            user.emp_number !==
            this.authService.getUserInformationFirebase().emp_number
        );
        this.dataSource.data = this.dataToDisplay;
      },
      error: () => {},
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  loadData() {
    this.isLoading = true;
    this.authService.getEmployeeNumber().subscribe({
      next: (empNumber: string) => {
        this.authService.getEmployeeDetails(empNumber).subscribe({
          next: (result) => {
            const { data } = result;
            this.currentUserEmpNumber = data.emp_number;
            this.userList$ = this.backendService.getAllUsers(data.emp_dept);
            this.handleDataSubscription();
          },
        });
      },
    });
  }

  handleDataSubscription() {
    this.userList$.subscribe({
      next: (data: IUserList[]) => {
        this.dataToDisplay = data.filter(
          (users) => users.emp_number !== this.currentUserEmpNumber
        );
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
    this.isLoading = false;
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

  deleteUser(element: any) {
    this.isLoading = true;
    const { empDocId, userId, email, emp_number } = element;
    // department: 'SCHOOL OF COMPUTING';
    // email: 'albertovillacarlos07@gmail.com';
    // empDocId: 'ivljwHxfpqjHTRLlzInJ';
    // emp_number: '03192002';
    // firstname: 'Albert0';
    // lastname: 'Villacarlos';
    // position: 'Student';
    // role: 'Admin';
    // userId: 'asfZcRDbvMgOtX1tMYA2';
    const indexToRemove = this.dataToDisplay.findIndex(
      (item: any) => item.empDocId === empDocId && item.userId === userId
    );

    this.backendService.deleteUserFirebase(emp_number, email).subscribe({
      next: () => {
        this.dataToDisplay.splice(indexToRemove, 1);
        this.dataSource.data = this.dataToDisplay;
        // Handle success, if needed
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        // Handle error, if needed
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
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
