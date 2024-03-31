import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../../components/dialog-box/dialog-box.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnDestroy {
  loginFormGroup: FormGroup;
  isLoading = false; // Variable to track isLoading state
  private unsubscribe$: Subject<void> = new Subject<void>();
  dialogBoxConfig = {
    width: '300px',
    enterAnimationDuration: '200ms',
    exitAnimationDuration: '400ms',
  };
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.loginFormGroup = this.formBuilder.group({
      email: ['albertovillacarlos07@gmail.com', [Validators.required]],
      password: ['villacarlos12', [Validators.required]],
    });
  }

  // login(): void {
  //   if (this.loginFormGroup.invalid) return;
  //   const { email, password } = this.loginFormGroup.value;
  //   // this.authService.setEmailAddress(email);
  //   // this.authService.setPassword(password);
  //   // this.authService.isAuthenticated$
  //   //   .pipe(takeUntil(this.unsubscribe$))
  //   //   .subscribe({
  //   //     next: (t) => {
  //   //       this.router.navigate(['dashboard']);
  //   //     },
  //   //     error: (err) => {
  //   //       console.log(err);
  //   //     },
  //   //   });

  //   // this.authService.authenticate();

  // }
  // async login() {
  //   try {
  //     if (this.loginFormGroup.invalid) return;
  //     const { email, password } = this.loginFormGroup.value;
  //     const isLoggedIn = await this.authService.fireBaseLogin(email, password);
  //     if (isLoggedIn) {
  //       console.log('Login successful');
  //       // Redirect the user to the dashboard or any other page
  //     } else {
  //       console.log('Login failed: Invalid credentials');
  //       // Display an error message to the user
  //     }
  //   } catch (error) {
  //     console.error('Error logging in:', error);
  //     // Handle the error appropriately (e.g., display an error message)
  //   }
  // }

  async login() {
    try {
      if (this.loginFormGroup.invalid || this.isLoading) return;

      // Set isLoading to true when logging in
      this.isLoading = true;

      const { email, password } = this.loginFormGroup.value;
      const isLoggedIn = await this.authService.fireBaseLogin(email, password);

      if (isLoggedIn) {
        // Redirect the user to the dashboard or any other page
        this.router.navigate(['dashboard']);
      } else {
        const dialogBoxData = {
          title: 'Login failed',
          content: 'Invalid email or password. Please try again.',
          buttons: [
            {
              isVisible: true,
              matDialogCloseValue: false,
              content: 'Ok',
            },
            {
              isVisible: false,
              matDialogCloseValue: true,
              content: '',
            },
          ],
        };
        this.dialog.open(DialogBoxComponent, {
          ...this.dialogBoxConfig,
          data: dialogBoxData,
        });
      }
    } catch (error) {
      const dialogBoxData = {
        title: 'Internal Server Error',
        content:
          'Oops! Something went wrong on the server. Please try again later.',
        buttons: [
          {
            isVisible: true,
            matDialogCloseValue: false,
            content: 'Ok',
          },
          {
            isVisible: false,
            matDialogCloseValue: true,
            content: '',
          },
        ],
      };
      this.dialog.open(DialogBoxComponent, {
        ...this.dialogBoxConfig,
        data: dialogBoxData,
      });
    } finally {
      // Set isLoading back to false when login attempt is complete
      this.isLoading = false;
    }
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
