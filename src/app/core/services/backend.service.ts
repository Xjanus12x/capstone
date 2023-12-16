import { Injectable } from '@angular/core';
import { IEmployeeDetails } from '../models/EmployeeDetails';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUserAccount } from '../models/UserAccount';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  // Define the base API URL
  private apiBaseUrl = 'http://localhost:8085/api';
  private details!: IEmployeeDetails;
  private accountDetails!: IUserAccount;
  private unconfirmedEmail: string = '';

  constructor(private http: HttpClient) {}

  // getAllEmployeesDetails(): Observable<IEmployeeDetails[]> {
  //   return this.http.get<IEmployeeDetails[]>(
  //     `${this.apiBaseUrl}/employee-details`
  //   );
  // }

  getAllEmployeesDetails(): Observable<HttpResponse<any>> {
    return this.http.get(`${this.apiBaseUrl}/employee-details`, {
      observe: 'response',
    });
  }

  setEmployeeDetails(details: IEmployeeDetails): void {
    this.details = details;
    console.log('detailssz', this.getEmployeeDetails());
  }

  getEmployeeDetails(): IEmployeeDetails {
    return this.details;
  }

  setUserAccountDetails(user: IUserAccount): void {
    this.accountDetails = user;
    console.log('accs', this.getUserAccountDetails());
  }

  getUserAccountDetails(): IUserAccount {
    return this.accountDetails;
  }

  addEmployeeDetails(): void {
    this.http
      .post(
        `${this.apiBaseUrl}/employee-details/add`,
        this.getEmployeeDetails()
      )
      .subscribe(
        (resultData: any) => {
          console.log(resultData);
          alert('Succesffull Personal');
        },
        (error) => {
          console.error('Error registering personal:', error);
          // Handle the error, e.g., show an error message to the user
        }
      );
  }

  addUserAccount() {
    this.http
      .post(`${this.apiBaseUrl}/user/register`, this.getUserAccountDetails())
      .subscribe(
        (resultData: any) => {
          console.log(resultData);
          if (resultData.status) {
            alert('Nice');
          }
        },
        (error) => {
          console.error('Error registering personal:', error);
          // Handle the error, e.g., show an error message to the user
        }
      );
  }
  private onRegisterEmail!: string;
  setUnconfirmedEmail(email: string): void {
    this.unconfirmedEmail = email;
  }

  getUnconfirmedEmail(): string {
    return this.unconfirmedEmail;
  }
  
  checkEmailExistence(): Observable<any> {
    const email = this.getUnconfirmedEmail();
    return this.http.post(`${this.apiBaseUrl}/user/check-existence`, {
      emp_email: email,
    });
  }

  registerUser() {
    this.addEmployeeDetails();
    this.addUserAccount();
  }
}
