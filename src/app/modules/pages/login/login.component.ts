import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../../components/dialog-box/dialog-box.component';
import { BackendService } from 'src/app/core/services/backend.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginFormGroup: FormGroup;
  isLoading = false; // Variable to track isLoading state
  private unsubscribe$: Subject<void> = new Subject<void>();
  private employeeDetails: any = {};
  dialogBoxConfig = {
    width: '300px',
    enterAnimationDuration: '200ms',
    exitAnimationDuration: '400ms',
  };
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private backendService: BackendService
  ) {
    this.loginFormGroup = this.formBuilder.group({
      email: ['albertovillacarlos07@gmail.com', [Validators.required]],
      password: ['villacarlos12', [Validators.required]],
    });
  }

  ngOnInit() {
    if (this.authService.autoLogin()) {
      const { role, department } =
        this.authService.getUserInformationFirebase();

      if (role === 'Admin') {
        this.backendService
          .fetchAllObjectivesAndActionPlansByDept(department)
          .subscribe({
            next: (data: any[]) => {
              this.backendService.setAllObjectiveAndActionPlansByDept(data);
            },
            error: (error) => {
              this.backendService.setAllObjectiveAndActionPlansByDept([]);
            },
          });
      }
      this.router.navigate(['dashboard']);
    }
  }

  login() {
    if (this.loginFormGroup.invalid || this.isLoading) return;
    // Set isLoading to true when logging in
    this.isLoading = true;
    const { email, password } = this.loginFormGroup.value;
    this.authService.fireBaseLogin(email, password).subscribe({
      next: (loggedIn: boolean) => {
        if (loggedIn) {
          // Redirect the user to the dashboard or any other page
          const { role, department } =
            this.authService.getUserInformationFirebase();
          console.log(role);
          localStorage.setItem(
            'userData',
            JSON.stringify(this.authService.getUserInformationFirebase())
          );
          if (role === 'Admin') {
            this.backendService
              .fetchAllObjectivesAndActionPlansByDept(department)
              .subscribe({
                next: (data: any[]) => {
                  this.backendService.setAllObjectiveAndActionPlansByDept(data);
                },
                error: (error) => {
                  this.backendService.setAllObjectiveAndActionPlansByDept([]);
                },
                complete: () => {
                  console.log(this.authService.getUserInformationFirebase());
                },
              });
          }
          this.router.navigate(['dashboard']);

          //       // localStorage.setItem(
          //       //   'userData',
          //       //   JSON.stringify(this.authService.getUserInformationFirebase())
          //       // );
        } else {
          // Handle failed login
          console.log('Login failed');
          // Display error message or perform other actions
        }
      },
      error: (error) => {
        // Handle error
        console.error('Error during login:', error);
        // Display error message or perform other actions
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  // async login() {
  //   try {
  //     if (this.loginFormGroup.invalid || this.isLoading) return;

  //     // Set isLoading to true when logging in
  //     this.isLoading = true;

  //     const { email, password } = this.loginFormGroup.value;
  //     const isLoggedIn = await this.authService.fireBaseLogin(email, password);

  //     if (isLoggedIn) {
  //       // Redirect the user to the dashboard or any other page
  //       const { role, department } =
  //         this.authService.getUserInformationFirebase();
  //       console.log(
  //         'auth userinfo',
  //         this.authService.getUserInformationFirebase()
  //       );

  //       if (role === 'Admin') {
  //         this.backendService
  //           .fetchAllObjectivesAndActionPlansByDept(department)
  //           .subscribe({
  //             next: (data: any[]) => {
  //               this.backendService.setAllObjectiveAndActionPlansByDept(data);
  //             },
  //             error: (error) => {
  //               this.backendService.setAllObjectiveAndActionPlansByDept([]);
  //             },
  //           });
  //       }

  //       // localStorage.setItem(
  //       //   'userData',
  //       //   JSON.stringify(this.authService.getUserInformationFirebase())
  //       // );

  //       this.router.navigate(['dashboard']);
  //     } else {
  //       const dialogBoxData = {
  //         title: 'Login failed',
  //         content: 'Invalid email or password. Please try again.',
  //         buttons: [
  //           {
  //             isVisible: true,
  //             matDialogCloseValue: false,
  //             content: 'Ok',
  //           },
  //           {
  //             isVisible: false,
  //             matDialogCloseValue: true,
  //             content: '',
  //           },
  //         ],
  //       };
  //       this.dialog.open(DialogBoxComponent, {
  //         ...this.dialogBoxConfig,
  //         data: dialogBoxData,
  //       });
  //     }
  //   } catch (error) {
  //     const dialogBoxData = {
  //       title: 'Internal Server Error',
  //       content:
  //         'Oops! Something went wrong on the server. Please try again later.',
  //       buttons: [
  //         {
  //           isVisible: true,
  //           matDialogCloseValue: false,
  //           content: 'Ok',
  //         },
  //         {
  //           isVisible: false,
  //           matDialogCloseValue: true,
  //           content: '',
  //         },
  //       ],
  //     };
  //     this.dialog.open(DialogBoxComponent, {
  //       ...this.dialogBoxConfig,
  //       data: dialogBoxData,
  //     });
  //   } finally {
  //     // Set isLoading back to false when login attempt is complete
  //     this.isLoading = false;
  //   }
  // }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
