import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnDestroy {
  loginFormGroup!: FormGroup;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private _formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginFormGroup = this._formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  // test() {
  //   const email = this.loginFormGroup.value.email;
  //   const password = this.loginFormGroup.value.password;

  //   if (!email || !password) return;

  //   this.authService.setEmailAddress(email);
  //   this.authService.setPassword(password);
  //   this.authService.authenticate();

  //   console.log("comp",this.authService.isLogged);

  //   if (this.authService.getIsUserLogged()) {
  //     this.router.navigate(['dashboard']);
  //   }
  // }
  // ... (existing code)

  // test() {
  //   const email = this.loginFormGroup.value.email;
  //   const password = this.loginFormGroup.value.password;

  //   if (!email || !password) return;

  //   this.authService.setEmailAddress(email);
  //   this.authService.setPassword(password);
  //   this.authService.authenticate();

  //   this.authService.authenticationStatus$.subscribe((isUserLogged) => {
  //     console.log('comp', isUserLogged);

  //     if (isUserLogged) {
  //       this.router.navigate(['dashboard']);
  //     }
  //   });
  // }
  login(): void {
    const { email, password } = this.loginFormGroup.value;
    if (!email || !password) return;
    this.authService.setEmailAddress(email);
    this.authService.setPassword(password);
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (isAuthenticated) => {
          if (isAuthenticated) {
            this.router.navigate(['dashboard']);
          }
        },
      });
    this.authService.authenticate();
  }
  ngOnDestroy(): void {
    // Emit a signal to all subscribers to complete
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
