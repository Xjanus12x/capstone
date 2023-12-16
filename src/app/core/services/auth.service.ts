import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from 'src/app/modules/components/dialog-box/dialog-box.component';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // private apiBaseUrl = 'http://localhost:8085/api';

  // constructor(private http: HttpClient) {}
  // private currentUserSubject: BehaviorSubject<any>;
  // public currentUser: Observable<any>;

  // // Replace this with your backend API base URL
  // private apiBaseUrl = 'http://localhost:8085/api/';

  // constructor(private http: HttpClient) {
  //   this.currentUserSubject = new BehaviorSubject<any>(
  //     JSON.parse(localStorage.getItem('currentUser') || '{}')
  //   );
  //   this.currentUser = this.currentUserSubject.asObservable();
  // }

  // public get currentUserValue(): any {
  //   return this.currentUserSubject.value;
  // }

  // register(user: any): Observable<any> {
  //   return this.http.post<any>(`${this.apiBaseUrl}/register`, user).pipe(
  //     map((response) => {
  //       // store user details and jwt token in local storage
  //       localStorage.setItem('currentUser', JSON.stringify(response));
  //       this.currentUserSubject.next(response);
  //       return response;
  //     })
  //   );
  // }

  // login(email: string, password: string): Observable<any> {
  //   return this.http
  //     .post<any>(`${this.apiBaseUrl}/user/login`, { email, password })
  //     .pipe(
  //       map((response) => {
  //         // store user details and jwt token in local storage
  //         localStorage.setItem('currentUser', JSON.stringify(response));
  //         this.currentUserSubject.next(response);
  //         return response;
  //       })
  //     );
  // }

  // logout(): void {
  //   // remove user from local storage and set current user to null
  //   localStorage.removeItem('currentUser');
  //   this.currentUserSubject.next(null);
  // }

  // private email: string = '';
  // private password: string = '';
  // public isLogged: boolean = false;

  // setEmailAddress(email: string): void {
  //   this.email = email;
  // }
  // setPassword(password: string): void {
  //   this.password = password;
  // }

  // setIsLogged(isLogged: boolean): void {
  //   this.isLogged = isLogged;
  //   console.log('ss', this.getIsUserLogged());
  // }

  // getEmailAddress(): string {
  //   return this.email;
  // }
  // getPassword(): string {
  //   return this.password;
  // }

  // getIsUserLogged(): boolean {
  //   return this.isLogged;
  // }
  // getUserInput() {
  //   return {
  //     emp_email: this.getEmailAddress(),
  //     emp_password: this.getPassword(),
  //   };
  // }
  // // New Subject to notify the component about authentication status
  // private authenticationStatusSubject = new Subject<boolean>();

  // // Observable to which the component can subscribe
  // authenticationStatus$ = this.authenticationStatusSubject.asObservable();
  // authenticate() {
  //   this.http.post(`${this.apiBaseUrl}/login`, this.getUserInput()).subscribe(
  //     (resultData: any) => {
  //       console.log(resultData.status);
  //       if (resultData.status) {
  //         this.setIsLogged(resultData.status);
  //         this.authenticationStatusSubject.next(this.getIsUserLogged());
  //       }
  //     },
  //     (error) => {
  //       console.error('Error logging in:', error);

  //       // Access the status code
  //       const statusCode = error.status;
  //       console.log('Status Code:', statusCode);

  //       if (statusCode === 401) {
  //         alert('Invalid email or password');
  //       } else if (statusCode === 500) {
  //         alert('Internal Server Error');
  //       }

  //       // Notify the component about the authentication failure
  //       this.authenticationStatusSubject.next(false);
  //     }
  //   );
  // }
  // authenticate() {
  //   this.http.post(`${this.apiBaseUrl}/login`, this.getUserInput()).subscribe(
  //     (resultData: any) => {
  //       console.log(resultData.status);
  //       this.setIsLogged(resultData.status);
  //     },
  //     (error) => {
  //       console.error('Error logging in:', error);

  //       // Access the status code
  //       const statusCode = error.status;
  //       console.log('Status Code:', statusCode);

  //       if (statusCode === 401) {
  //         alert('Invalid email or password');
  //       } else if (statusCode === 500) {
  //         alert('Internal Server Error');
  //       }
  //     }
  //   );
  // }

  private apiBaseUrl = 'http://localhost:8085/api';

  private email: string = '';
  private password: string = '';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, public dialog: MatDialog) {}

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
  authenticate(): void {
    this.http.post(`${this.apiBaseUrl}/login`, this.getUserInput()).subscribe({
      next: (resultData: any) => {
        this.setIsLogged(resultData.status);
      },

      error: (error) => {
        const statusCode = error.status;

        if (statusCode === 401) {
          // alert('Invalid email or password');
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
                  isVisible: false,
                  matDialogCloseValue: false,
                  content: '',
                  tailwindClass: 'text-gray-600',
                },
                {
                  isVisible: true,
                  matDialogCloseValue: true,
                  content: 'Retry',
                  tailwindClass: 'text-red-500',
                },
              ],
            },
          });
        }

        this.setIsLogged(false);
      },
    });
  }
  // authenticate(): void {
  //   this.http.post(`${this.apiBaseUrl}/login`, this.getUserInput()).subscribe(
  //     (resultData: any) => {
  //       this.setIsLogged(resultData.status);
  //     },
  //     (error) => {
  //       const statusCode = error.status;

  //       if (statusCode === 401) {
  //         // alert('Invalid email or password');
  //       } else if (statusCode === 500) {
  //         this.dialog.open(DialogBoxComponent, {
  //           width: '300px',
  //           enterAnimationDuration: '200ms',
  //           exitAnimationDuration: '400ms',
  //           data: {
  //             title: 'Internal Server Error',
  //             content:
  //               'Oops! Something went wrong on the server. Please try again later.',
  //             buttons: [
  //               {
  //                 isVisible: false,
  //                 matDialogCloseValue: false,
  //                 content: '',
  //                 tailwindClass: 'text-gray-600',
  //               },
  //               {
  //                 isVisible: true,
  //                 matDialogCloseValue: true,
  //                 content: 'Retry',
  //                 tailwindClass: 'text-red-500',
  //               },
  //             ],
  //           },
  //         });
  //       }

  //       this.setIsLogged(false);
  //     }
  //   );
  // }

  getAuthenticationStatus(): Observable<boolean> {
    return this.isAuthenticated$;
  }
  
}
