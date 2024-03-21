import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnDestroy {
  loginFormGroup: FormGroup;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginFormGroup = this.formBuilder.group({
      email: ['socadmin@yahoo.com', [Validators.required]],
      password: ['socadmin1', [Validators.required]],
    });
  }

  login(): void {
    if (this.loginFormGroup.invalid) return;

    const { email, password } = this.loginFormGroup.value;

    this.authService.setEmailAddress(email);
    this.authService.setPassword(password);

    this.authService.isAuthenticated$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.router.navigate(['dashboard']);
      });

    this.authService.authenticate();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
