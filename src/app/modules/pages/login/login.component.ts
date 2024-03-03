import { Component, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnDestroy {
  loginFormGroup!: FormGroup;
  private unsubscribe$: Subject<void> = new Subject<void>();
  isAuth: boolean = false;
  constructor(
    private _formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginFormGroup = this._formBuilder.group({
      email: ['socadmin@yahoo.com', [Validators.required]],
      password: ['socadmin1', [Validators.required]],
    });
  }

  getFormControl(formControl: string) {
    return this.loginFormGroup.get(formControl) as FormControl;
  }
  login(): void {
    const { email, password } = this.loginFormGroup.value;
    if (!email || !password) return;
    this.authService.setEmailAddress(email);
    this.authService.setPassword(password);
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (isAuthenticated) => {
          if (isAuthenticated) this.router.navigate(['dashboard']);
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
