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
import * as bcrypt from 'bcryptjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
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

  getEmployeeNumber(): Observable<string> {
    return this.empNumber$;
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

  fireBaseLogin(email: string, password: string): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      // Query users collection to find user by email
      const usersCollection = collection(this.fs, 'users');
      const userQuery = query(usersCollection, where('email', '==', email));
      getDocs(userQuery)
        .then((userSnapshot) => {
          // Check if user with given email exists
          if (userSnapshot.empty) {
            this.setIsLogged(false);
            observer.next(false); // User not found
            observer.complete();
          } else {
            const userData: any = userSnapshot.docs[0].data();
            const hashedPassword = userData.password;

            // Compare the input password with the hashed password from the database
            bcrypt.compare(password, hashedPassword, (err, result) => {
              if (err) {
                console.error('Error comparing passwords:', err);
                observer.error(err);
              }

              if (!result) {
                this.setIsLogged(false);
                observer.next(false); // Password incorrect
                observer.complete();
              }

              // Password is correct, proceed with login
              const empDetailsCollection = collection(
                this.fs,
                'employee-details'
              );
              const empQuery = query(
                empDetailsCollection,
                where('emp_number', '==', userData.emp_number)
              );
              getDocs(empQuery).then((empSnapshot: any) => {
                if (!empSnapshot.empty) {
                  const empData = empSnapshot.docs[0].data();
                  const info = { ...userData, ...empData };
                  delete info.password; // Remove the password field
                  this.setUserInformationFirebase(info);
                  // // Set user role and mark as logged in
                  this.setIsLogged(true);
                  observer.next(true); // Login successful
                  observer.complete();
                } else {
                  console.log('Employee details not found');
                  this.setIsLogged(false);
                  observer.next(false); // Login successful
                  observer.complete();
                }
              });

              // // Set user role and mark as logged in
              // this.setIsLogged(true);
              // observer.next(true); // Login successful
              // observer.complete();
            });
          }
        })
        .catch((error) => {
          console.error('Error logging in:', error);
          observer.error(error);
        });
    });
  }
  // Orig
  // async fireBaseLogin(email: string, password: string): Promise<boolean> {
  //   try {
  //     // Query users collection to find user by email
  //     const usersCollection = collection(this.fs, 'users');
  //     const userQuery = query(usersCollection, where('email', '==', email));
  //     const userSnapshot = await getDocs(userQuery);

  //     // Check if user with given email exists
  //     if (userSnapshot.empty) {
  //       this.setIsLogged(false);
  //       return false; // User not found
  //     }

  //     // Extract user data
  //     const userData: any = userSnapshot.docs[0].data();
  //     const hashedPassword = userData.password;

  //     // Compare the input password with the hashed password from the database
  //     return new Promise<boolean>((resolve, reject) => {
  //       bcrypt.compare(password, hashedPassword, (err, result) => {
  //         if (err) {
  //           console.error('Error comparing passwords:', err);
  //           reject(err);
  //         }

  //         if (!result) {
  //           this.setIsLogged(false);
  //           resolve(false); // Password incorrect
  //         }

  //         // Password is correct, proceed with login
  //         const empDetailsCollection = collection(this.fs, 'employee-details');
  //         const empQuery = query(
  //           empDetailsCollection,
  //           where('emp_number', '==', userData.emp_number)
  //         );
  //         getDocs(empQuery).then((empSnapshot) => {
  //           if (!empSnapshot.empty) {
  //             const empData = empSnapshot.docs[0].data();
  //             const info = { ...userData, ...empData };
  //             delete info.password; // Remove the password field
  //             this.setUserInformationFirebase(info);
  //           } else {
  //             console.log('Employee details not found');
  //           }
  //         });

  //         // Set user role and mark as logged in
  //         this.setIsLogged(true);
  //         resolve(true); // Login successful
  //       });
  //     });
  //   } catch (error) {
  //     console.error('Error logging in:', error);
  //     throw error;
  //   }
  // }

  // async fireBaseLogin(email: string, password: string): Promise<boolean> {
  //   try {
  //     // Query users collection to find user by email and password
  //     const usersCollection = collection(this.fs, 'users');
  //     const userQuery = query(
  //       usersCollection,
  //       where('email', '==', email),
  //       where('password', '==', password)
  //     );

  //     const userSnapshot = await getDocs(userQuery);

  //     // Check if user with given email and password exists
  //     if (userSnapshot.empty) {
  //       this.setIsLogged(false);
  //       return false; // User not found or password incorrect
  //     }

  //     // Extract user data and remove sensitive fields
  //     const userData: any = userSnapshot.docs[0].data();
  //     delete userData.password;

  //     // Query employee details collection to find employee by emp_number
  //     const empDetailsCollection = collection(this.fs, 'employee-details');
  //     const empQuery = query(
  //       empDetailsCollection,
  //       where('emp_number', '==', userData.emp_number)
  //     );
  //     const empSnapshot = await getDocs(empQuery);

  //     // Check if employee details exist
  //     if (!empSnapshot.empty) {
  //       const empData = empSnapshot.docs[0].data();
  //       // Do something with the employee details data

  //       const info = { ...userData, ...empData };
  //       this.setUserInformationFirebase(info);
  //       // Store user data in session storage
  //       localStorage.setItem(
  //         'userData',
  //         JSON.stringify(this.getUserInformationFirebase())
  //       );
  //     } else {
  //       console.log('Employee details not found');
  //     }

  //     // Set user role and mark as logged in
  //     this.setIsLogged(true);
  //     return true; // Login successful
  //   } catch (error) {
  //     console.error('Error logging in:', error);
  //     throw error;
  //   }
  // }

  logoutUser() {
    localStorage.removeItem('userData');
    this.setIsLogged(false);
  }

  autoLogin(): boolean {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.setUserInformationFirebase(userData);
      // Your authentication logic here (e.g., verify token, check expiration)
      // For simplicity, let's assume the user is automatically logged in
      this.setIsLogged(true);
      return true;
    } else {
      return false;
    }
  }

  private setUserInformationFirebase(info: any) {
    this.userInformation = info;
  }

  getUserInformationFirebase(): any {
    return this.userInformation;
  }
  fetchSpecificUserInformation(empNumber: string) {
    return new Observable((observer) => {
      const userCollection = collection(this.fs, 'users');
      const employeeDetailsCollection = collection(this.fs, 'employee-details');

      (async () => {
        try {
          // Query the 'users' collection to find the user document matching the employee number
          const userQuerySnapshot = await getDocs(
            query(userCollection, where('emp_number', '==', empNumber))
          );

          // Check if a user document with the specified employee number exists
          if (!userQuerySnapshot.empty) {
            // Get the user document data
            const userDoc = userQuerySnapshot.docs[0];
            const { password, ...rest } = userDoc.data();

            // Query the 'employee-details' collection to find the details for this user
            const employeeDetailsQuerySnapshot = await getDocs(
              query(
                employeeDetailsCollection,
                where('emp_number', '==', empNumber)
              )
            );

            // Check if employee details are found for this user
            if (!employeeDetailsQuerySnapshot.empty) {
              // Get the employee details document data
              const employeeDetailsDoc = employeeDetailsQuerySnapshot.docs[0];
              const employeeDetailsData = employeeDetailsDoc.data();

              // Emit the user data and employee details data
              observer.next({ ...rest, ...employeeDetailsData });
            } else {
              console.log(
                'Employee details not found for user with employee number:',
                empNumber
              );
              observer.next(null);
            }
          } else {
            console.log('User with employee number:', empNumber, 'not found.');
            observer.next(null);
          }

          observer.complete();
        } catch (error) {
          console.error('Error fetching user information:', error);
          observer.error(error);
        }
      })();
    });
  }
}
