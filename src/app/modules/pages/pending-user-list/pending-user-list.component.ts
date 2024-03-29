import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { IUserList } from 'src/app/core/models/UsersList';
import { AuthService } from 'src/app/core/services/auth.service';
import { BackendService } from 'src/app/core/services/backend.service';
import { UpdateUserComponent } from '../../components/update-user/update-user.component';
import { IPendingUser } from 'src/app/core/models/PendingUser';
import { UpdatePendingUserComponent } from '../../components/update-pending-user/update-pending-user.component';

@Component({
  selector: 'app-pending-user-list',
  templateUrl: './pending-user-list.component.html',
  styleUrls: ['./pending-user-list.component.css'],
})
export class PendingUserListComponent {
  constructor(
    private backendService: BackendService,
    private authService: AuthService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}
  pendingUserList$!: Observable<IPendingUser[]>;
  dataToDisplay: IPendingUser[] = [];
  selection = new SelectionModel<any>(true, []);
  dataSource = new MatTableDataSource<any>();
  displayedHeader: string[] = [
    'Email',
    'User Role',
    'Firstname',
    'Lastname',
    'Employee Number',
    'Department',
    'Position',
  ];
  displayedColumns: string[] = [
    'email',
    'role',
    'emp_firstname',
    'emp_lastname',
    'emp_number',
    'emp_dept',
    'emp_position',
  ];
  isLoading = true;
  currentUserEmpNumber: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  test: any[] = [];

  ngOnInit(): void {
    this.isLoading = true;
    // this.loadData();
    this.backendService
      .getPendingUsersFirebase('SCHOOL OF COMPUTING')
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.isLoading = false;
          this.cdr.detectChanges(); // Trigger change detection
        },
        error: (error) => {
          console.error('Error fetching pending users:', error);
        },
      });
  }

  // loadData() {
  //   this.isLoading = true;
  //   // this.authService.getEmployeeDepartment().subscribe({
  //   //   next: (dept: string) => {
  //   //     this.pendingUserList$ = this.backendService.getPendingUsers(dept);
  //   //     this.handleDataSubscription();
  //   //   },
  //   //   error: (error) => this.handleError(error),
  //   // });

  //   this.backendService
  //     .getPendingUsersFirebase('SCHOOL OF COMPUTING')
  //     .subscribe({
  //       next: (data) => {
  //         console.log(data);

  //         this.dataToDisplay = data;
  //         this.updateDataSource();
  //       },
  //     });

  //   // this.handleDataSubscription();
  // }

  loadData() {
    // this.isLoading = true;
    // this.backendService
    //   .getPendingUsersFirebase('SCHOOL OF COMPUTING')
    //   .subscribe({
    //     next: (data) => {
    //       this.dataSource.data = data;
    //       // this.isLoading = false;
    //     },
    //     error: (error) => {
    //       console.error('Error fetching pending users:', error);
    //     },
    //   });
  }

  ngAfterViewInit() {}
  // handleDataSubscription() {
  //   this.pendingUserList$.subscribe({
  //     next: (data: any[]) => {
  //       console.log(data);

  //       this.dataToDisplay = data;
  //       this.updateDataSource();
  //     },
  //     error: (error) => {
  //       console.error('Error:', error);
  //       // Handle error here (e.g., display error message)
  //       this.isLoading = false;
  //     },
  //   });
  // }

  updateDataSource() {
    this.dataSource = new MatTableDataSource(this.dataToDisplay);
    this.dataSource.paginator = this.paginator; // Set paginator after data is loaded
    this.dataSource.sort = this.sort;
    // this.isLoading = false;
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

  rejectUser(id: number) {
    const indexToRemove = this.dataToDisplay.findIndex(
      (item) => item.id === id
    );

    // If the item is found, remove it from the array
    if (indexToRemove === -1) return;
    this.backendService.deletePendingUser(id).subscribe({
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
  acceptUser(element: IPendingUser) {
    console.log(element);

    // this.backendService.acceptPendingUser(element).subscribe({
    //   next: () => {
    //     this.authService.openSnackBar(
    //       'Pending user accepted successfully',
    //       'Close',
    //       'bottom'
    //     );
    //     const id = element.id;
    //     const indexToRemove = this.dataToDisplay.findIndex(
    //       (item) => item.id === id
    //     );
    //     // If the item is found, remove it from the array
    //     if (indexToRemove === -1) return;
    //     this.backendService.deletePendingUser(id!).subscribe({
    //       next: () => {
    //         this.dataToDisplay.splice(indexToRemove, 1);
    //         this.dataSource.data = this.dataToDisplay;
    //         this.updateDataSource();
    //       },
    //     });
    //   },
    //   error: (error) => this.handleError(error),
    // });



    

  }

  updateUser(pendingUser: IPendingUser) {
    const dialogRef = this.dialog.open(UpdatePendingUserComponent, {
      data: pendingUser,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      if (result.invalid) {
        this.authService.openSnackBar('Invalid inputs', 'Close', 'bottom');
        return;
      }

      const orginalData = [
        pendingUser.emp_firstname,
        pendingUser.emp_lastname,
        pendingUser.emp_number,
        pendingUser.role,
        pendingUser.emp_dept,
        pendingUser.emp_position,
      ].join(',');

      const updateData = Object.values(result.value).join(',');

      if (orginalData === updateData) {
        this.authService.openSnackBar('No changes made', 'Close', 'bottom');
        return;
      }
      const id = pendingUser.id;
      const updatedPendingUserInfo = { id, ...result.value };

      this.backendService.updatePendingUser(updatedPendingUserInfo).subscribe({
        next: () => {
          this.authService.openSnackBar(
            `Pengind user successfully updated`,
            'close',
            'bottom'
          );
          // this.handleDataSubscription();
        },
      });
    });
  }
}
