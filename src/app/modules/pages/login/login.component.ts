import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginFormGroup!: FormGroup;
  constructor(private _formBuilder: FormBuilder, private http: HttpClient) {
    this.loginFormGroup = this._formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  apiBaseUrl = 'http://localhost:8085/api';
  test() {
    console.log(this.loginFormGroup.value);
    this.http
      .post(`${this.apiBaseUrl}/login`, this.loginFormGroup.value)
      .subscribe(
        (resultData: any) => {
          console.log(resultData);
          alert('nice');
        },
        (error) => {
          console.error('Error registering personal:', error);
          // Handle the error, e.g., show an error message to the user
        }
      );
  }
}
