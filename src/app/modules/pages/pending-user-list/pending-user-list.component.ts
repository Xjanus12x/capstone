import { SelectionModel } from '@angular/cdk/collections';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import { DatePipe } from '@angular/common';
import { dialogBoxConfig } from 'src/app/core/constants/DialogBoxConfig';
import { IDialogBox } from 'src/app/core/models/DialogBox';
import { DialogBoxComponent } from '../../components/dialog-box/dialog-box.component';

@Component({
  selector: 'app-pending-user-list',
  templateUrl: './pending-user-list.component.html',
  styleUrls: ['./pending-user-list.component.css'],
})
export class PendingUserListComponent implements OnInit, AfterViewInit {
  constructor(
    private backendService: BackendService,
    private authService: AuthService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe
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
    // 'Position',
  ];
  displayedColumns: string[] = [
    'email',
    'role',
    'emp_firstname',
    'emp_lastname',
    'emp_number',
    'emp_dept',
    // 'emp_position',
  ];
  isLoading = true;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  currentUserDepartment: string = '';
  ngOnInit(): void {
    // this.loadData();
    this.isLoading = true;
    this.currentUserDepartment =
      this.authService.getUserInformationFirebase().department;
    this.backendService
      .getPendingUsersFirebase(this.currentUserDepartment)
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.dataToDisplay = data;
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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator; // Set paginator after data is loaded
    this.dataSource.sort = this.sort;
  }
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

  rejectUser(element: IPendingUser) {
    // Open confirmation dialog
    const dialogBoxData: IDialogBox = {
      title: 'Reject User Registration',
      content:
        "Are you sure you want to reject this user's registration request? This action cannot be undone.",
      buttons: [
        {
          isVisible: true,
          matDialogCloseValue: false,
          content: 'No',
        },
        {
          isVisible: true,
          matDialogCloseValue: true,
          content: 'Yes, Reject Registration',
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
          this.isLoading = true;
          const { emp_firstname, emp_lastname, email } = element;
          const { firstname, lastname, department } =
            this.authService.getUserInformationFirebase();
          this.backendService
            .deleteDocumentByEmailFirebase(element.email)
            .then(() => {
              const id = element.id;
              const indexToRemove = this.dataToDisplay.findIndex(
                (item) => item.id === id
              );
              this.dataToDisplay.splice(indexToRemove, 1);
              this.dataSource.data = this.dataToDisplay;
              this.isLoading = false;
              this.authService.openSnackBar(
                'Pending user rejected successfully.',
                'close',
                'bottom'
              );
              const pendingUserFullname =
                `${emp_firstname} ${emp_lastname}`.toUpperCase();
              const adminName = `${firstname} ${lastname}`.toUpperCase();
              const message = `"${adminName}" has rejected "${pendingUserFullname}" as a new faculty user.`;
              const timeStamp = this.datePipe.transform(
                new Date(),
                'yyyy-MM-dd'
              );
              this.backendService.addLog({
                message,
                timestamp: timeStamp,
                department: department,
                type: 'rejected-users',
              });

              const rejectedUserFullname =
                `${emp_firstname} ${emp_lastname}`.toUpperCase();

              this.backendService.sendEmail(
                `${adminName}`, // recipient name (user whose registration is rejected)
                `${rejectedUserFullname}`, // sender name (admin who rejected the registration)
                `
          Dear ${rejectedUserFullname},

          We regret to inform you that your registration has been rejected by ${adminName}. Please contact us for further assistance.

          Best regards,
          ${adminName}
        `, // email message
                `Registration Rejected`, // email subject
                email // recipient email address
              );
            })
            .catch((error) => {
              this.isLoading = false;
              this.authService.openSnackBar(
                'Error rejecting user.',
                'close',
                'bottom'
              );
            });
        }
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
  acceptUser(element: IPendingUser) {
    this.isLoading = true;
    this.backendService.acceptPendingUserFirebase(element).subscribe({
      next: () => {
        const { email, emp_firstname, emp_lastname } = element;
        const { firstname, lastname, department } =
          this.authService.getUserInformationFirebase();
        this.backendService
          .deleteDocumentByEmailFirebase(email)
          .then(() => {
            const id = element.id;
            const indexToRemove = this.dataToDisplay.findIndex(
              (item) => item.id === id
            );
            this.dataToDisplay.splice(indexToRemove, 1);
            this.dataSource.data = this.dataToDisplay;
            this.isLoading = false;
            this.authService.openSnackBar(
              'Pending user accepted successfully.',
              'close',
              'bottom'
            );
            const pendingUserFullname =
              `${emp_firstname} ${emp_lastname}`.toUpperCase();
            const adminName = `${firstname} ${lastname}`.toUpperCase();
            const message = `"${adminName}" has accepted "${pendingUserFullname}" as a new faculty user.`;
            const timeStamp = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
            this.backendService.addLog({
              message,
              timestamp: timeStamp,
              department: department,
              type: 'accepted-users',
            });

            const acceptedUserFullname =
              `${emp_firstname} ${emp_lastname}`.toUpperCase();

            this.backendService.sendEmail(
              `${adminName}`, // recipient name (user whose registration is accepted)
              `${acceptedUserFullname}`, // sender name (admin who accepted the registration)
              `
            Dear ${acceptedUserFullname},

            We are pleased to inform you that your registration has been accepted by ${adminName}. You are now a new user.

            Best regards,
            ${adminName}
            `, // email message
              `Registration Accepted`, // email subject
              email // recipient email address
            );
          })
          .catch((error) => {
            this.isLoading = false;
            this.authService.openSnackBar(
              'Error deleting document.',
              'close',
              'bottom'
            );
          });
      },
      error: (error) => {
        this.authService.openSnackBar(
          'Error accepting pending user',
          'close',
          'bottom'
        );
        console.error('Error accepting pending user:', error); // Log the error message
      },
    });
  }

  updateUser(pendingUser: IPendingUser) {
    const dialogRef = this.dialog.open(UpdatePendingUserComponent, {
      data: pendingUser,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      if (result.invalid) {
        this.authService.openSnackBar('Invalid inputs', 'Close', 'bottom');
        this.isLoading = false;
        return;
      }
      const { emp_firstname, emp_lastname } = pendingUser;
      const { firstname, lastname, department } =
        this.authService.getUserInformationFirebase();
      this.isLoading = true;
      const orginalData = [
        pendingUser.emp_firstname,
        pendingUser.emp_lastname,
        pendingUser.emp_number,
        pendingUser.role,
        pendingUser.emp_dept,
        // pendingUser.emp_position,
      ].join(',');

      const updateData = Object.values(result.value).join(',');

      if (orginalData === updateData) {
        this.authService.openSnackBar('No changes made', 'Close', 'bottom');
        this.isLoading = false;
        return;
      }
      const updatedPendingUserInfo = result.value;
      console.log(updatedPendingUserInfo);

      this.backendService
        .updateUserInformationFirebase(
          updatedPendingUserInfo,
          pendingUser.email
        )
        .subscribe({
          next: () => {
            // Handle successful update

            this.refreshDataSource();

            const pendingUserFullname =
              `${emp_firstname} ${emp_lastname}`.toUpperCase();
            const adminName = `${firstname} ${lastname}`.toUpperCase();
            const message = `"${adminName}" has updated the user information for "${pendingUserFullname}" as a new faculty user.`;
            const timeStamp = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
            this.backendService.addLog({
              message,
              timestamp: timeStamp,
              department: department,
              type: 'updated-pending-users',
            });

            this.backendService.sendEmail(
              `${adminName}`, // recipient name (user whose information is updated)
              `${pendingUserFullname}`, // sender name (admin who updated the registration)
              `
              Dear ${pendingUserFullname},

              We would like to inform you that your information has been updated by ${adminName}. If you have any questions or concerns regarding the changes, please don't hesitate to contact us.

              Best regards,
              ${adminName}
              `, // email message
              `Account Information Updated`, // email subject
              pendingUser.email // recipient email address
            );
          },
          error: (error) => {
            this.authService.openSnackBar(
              'Failed updating pending user',
              'close',
              'bottom'
            );
            this.isLoading = false;
            // Handle error
          },
        });
    });
  }
  refreshDataSource() {
    this.backendService
      .getPendingUsersFirebase('SCHOOL OF COMPUTING')
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.dataToDisplay = data;
          this.isLoading = false;
          this.authService.openSnackBar(
            'Pending user updated successfully',
            'close',
            'bottom'
          );
          this.cdr.detectChanges(); // Trigger change detection
        },
        error: (error) => {
          console.error('Error fetching pending users:', error);
          this.isLoading = false;
        },
      });
  }
}
