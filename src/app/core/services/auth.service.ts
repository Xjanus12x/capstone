import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from 'src/app/modules/components/dialog-box/dialog-box.component';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { IUserList } from '../models/UsersList';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //prod
  // private apiBaseUrl = 'sql6.freesqldatabase.com:3306/api';
  //live
  // private apiBaseUrl: string = '118.139.176.23/api';
  // test
  // private apiBaseUrl = 'sql.freedb.tech/api';
  // test
  private apiBaseUrl = 'http://haucommit.com/api';
  // // test2
  // private apiBaseUrl = '118.139.176.23/api';
  // test3
  // private apiBaseUrl = 'https://haucommit.com/api';
  // test4
  // private apiBaseUrl = 'https://haucommit.com/api';

  private email: string = '';
  private password: string = '';
  private empDeptSubject = new BehaviorSubject<string>('');
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private empNumberSubject = new BehaviorSubject<string>('');
  private userRoleSubject = new BehaviorSubject<string>('');
  private updateStatusSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  userRole$: Observable<string> = this.userRoleSubject.asObservable();
  empDept$: Observable<string> = this.empDeptSubject.asObservable();
  empNumber$: Observable<string> = this.empNumberSubject.asObservable();
  updateStatus$: Observable<boolean> = this.updateStatusSubject.asObservable();

  // firebase
  userRoleFirebase: string = '';
  userInformation: any = {};
  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fs: Firestore
  ) {}

  private setUpdateStatus(status: boolean): void {
    this.updateStatusSubject.next(status);
  }
  getUpdateStatus(): Observable<boolean> {
    return this.updateStatus$;
  }
  setEmailAddress(email: string): void {
    this.email = email;
  }

  setPassword(password: string): void {
    this.password = password;
  }

  private setIsLogged(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  private getUserInput() {
    return {
      emp_email: this.email,
      emp_password: this.password,
    };
  }

  private setUserRole(role: string): void {
    this.userRoleSubject.next(role);
  }

  private setEmployeeDepartment(empDept: string): void {
    this.empDeptSubject.next(empDept);
  }
  private setEmployeeNumber(empNumber: string): void {
    this.empNumberSubject.next(empNumber);
  }

  getAuthenticationStatus(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  getUserRole(): Observable<string> {
    return this.userRole$;
  }

  getEmployeeDepartment(): Observable<string> {
    return this.empDept$;
  }
  logoutUser() {
    this.setIsLogged(false);
  }
  getEmployeeNumber(): Observable<string> {
    return this.empNumber$;
  }

  getEmployeeDetails(emp_number: string): Observable<any> {
    const params = new HttpParams().set('emp_number', emp_number);
    return this.http.get(`${this.apiBaseUrl}/get/employee-details`, { params });
  }

  authenticate(): void {
    this.http.post(`${this.apiBaseUrl}/login`, this.getUserInput()).subscribe({
      next: (response: any) => {
        this.setIsLogged(response.status);
        this.setUserRole(response.data.emp_role);
        this.setEmployeeDepartment(response.data.emp_dept);
        this.setEmployeeNumber(response.data.emp_number);
      },

      error: (error) => {
        const statusCode = error.status;
        if (statusCode === 401) {
          this.openSnackBar('Invalid Email or Password', 'Close');
        } else if (statusCode === 500) {
          this.dialog.open(DialogBoxComponent, {
            width: '300px',
            enterAnimationDuration: '200ms',
            exitAnimationDuration: '400ms',
            data: {
              title: 'Internal Server Error',
              content:
                'Oops! Something went wrong on the server. Please try again later.',
              buttons: [
                {
                  isVisible: true,
                  matDialogCloseValue: false,
                  content: 'Retry',
                },
                {
                  isVisible: false,
                  matDialogCloseValue: true,
                  content: '',
                },
              ],
            },
          });
        }

        this.setIsLogged(false);
      },
    });
  }

  updateUserInformation(info: IUserList): void {
    this.http.post(`${this.apiBaseUrl}/update/user`, info).subscribe({
      next: (response) => {
        const status = Object.values(response);
        this.setUpdateStatus(status[0]);
      },
      error: (error) => {
        this.openSnackBar(`User update failed`, 'close', 'bottom');
      },
    });
  }

  openSnackBar(
    message: string,
    action: string,
    position: MatSnackBarVerticalPosition = 'top'
  ): void {
    const config: MatSnackBarConfig = {
      duration: 10000,
      verticalPosition: position,
    };

    this.snackBar.open(message, action, config);
  }

  // async fireBaseLogin(email: string, password: string): Promise<boolean> {
  //   try {
  //     const usersCollection = collection(this.fs, 'users');
  //     const q = query(
  //       usersCollection,
  //       where('email', '==', email),
  //       where('password', '==', password)
  //     );
  //     const querySnapshot = await getDocs(q);
  //     this.setIsLogged(!querySnapshot.empty);
  //     if (!querySnapshot.empty) {
  //       const userData: any = querySnapshot.docs[0].data();
  //       delete userData.password;

  //       const employeeDetailsCollection = collection(
  //         this.fs,
  //         'employee-details'
  //       );

  //       this.setUserRoleFirebase(userData.role);
  //     }
  //     return !querySnapshot.empty;
  //   } catch (error) {
  //     console.error('Error logging in:', error);
  //     throw error;
  //   }
  // }

  async fireBaseLogin(email: string, password: string): Promise<boolean> {
    try {
      // Query users collection to find user by email and password
      const usersCollection = collection(this.fs, 'users');
      const userQuery = query(
        usersCollection,
        where('email', '==', email),
        where('password', '==', password)
      );
      const userSnapshot = await getDocs(userQuery);

      // Check if user with given email and password exists
      if (userSnapshot.empty) {
        this.setIsLogged(false);
        return false; // User not found or password incorrect
      }

      // Extract user data and remove password field
      const userData: any = userSnapshot.docs[0].data();
      delete userData.password;

      // Query employee details collection to find employee by emp_number
      const empDetailsCollection = collection(this.fs, 'employee-details');
      const empQuery = query(
        empDetailsCollection,
        where('emp_number', '==', userData.emp_number)
      );
      const empSnapshot = await getDocs(empQuery);

      // Check if employee details exist
      if (!empSnapshot.empty) {
        const empData = empSnapshot.docs[0].data();
        // Do something with the employee details data

        const info = {...userData,...empData}
        this.setUserInformationFirebase(info);        
        
      } else {
        console.log('Employee details not found');
      }
      // Set user role and mark as logged in
      this.setIsLogged(true);
      return true; // Login successful
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }




  private setUserInformationFirebase(info: any) {
    this.userInformation = info;
  }
  getUserInformationFirebase(): any {
    return this.userInformation;
  }
}
