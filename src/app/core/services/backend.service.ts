import { Injectable } from '@angular/core';
import { IEmployeeDetails } from '../models/EmployeeDetails';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUserAccount } from '../models/UserAccount';
import { AuthService } from './auth.service';
import { RouterService } from 'src/app/modules/services/router-service.service';
import { ISubmittedIGCF } from '../models/SubmittedIgcf';
import { ISignedIgcf } from '../models/SignedIGCF';
import { IUserList } from '../models/UsersList';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  // Define the base API URL
  private apiBaseUrl = 'http://localhost:8085/api';
  private details!: IEmployeeDetails;
  private accountDetails!: IUserAccount;
  private unconfirmedEmail: string = '';
  private igcfValues!: any;
  private currentIgcfId!: number;
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private routerService: RouterService
  ) {}

  deleteSubmittedIgcf(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiBaseUrl}/del/submitted-igcf/${id}`);
  }

  getIgcfInformations(deptName: string): Observable<any> {
    const params = new HttpParams().set('dept_name', deptName);
    return this.http.get(`${this.apiBaseUrl}/igcf-information`, { params });
  }
  getNumberOfSubmittedIgcf() {
    return this.http.get(`${this.apiBaseUrl}/get/igcf-number-of-submissions`);
  }
  getAllUsers(deptName: string) {
    const params = new HttpParams().set('dept_name', deptName);
    return this.http.get<IUserList[]>(`${this.apiBaseUrl}/get/users`, {
      params,
    });
  }
  setEmployeeDetails(details: IEmployeeDetails): void {
    this.details = details;
  }
  setCurrentIgcfId(id: number) {
    this.currentIgcfId = id;
  }

  setIgcfDeadline(deadlineInfo: { dept: string; date: string }) {
    this.http
      .post<any>(`${this.apiBaseUrl}/set/igcf-deadline`, deadlineInfo)
      .subscribe(
        (response) => {
          this.authService.openSnackBar(
            'IGCF deadline set successfully',
            'close',
            'bottom'
          );
        },
        (error) => {
          this.authService.openSnackBar(
            'Failed to set IGCF deadline',
            'close',
            'bottom'
          );
        }
      );
  }

  getIgcfDeadline(dept: string): Observable<any[]> {
    const params = new HttpParams().set('dept', dept);
    return this.http.get<any[]>(`${this.apiBaseUrl}/get/dead-lines`, {
      params,
    });
  }

  getIgcfPercentages(dept: string): Observable<any[]> {
    const params = new HttpParams().set('dept', dept);
    return this.http.get<any[]>(`${this.apiBaseUrl}/get/igcf-informations`, {
      params,
    });
  }

  getCurrentIgcfId() {
    return this.currentIgcfId;
  }

  private getEmployeeDetails(): IEmployeeDetails {
    return this.details;
  }

  setUserAccountDetails(user: IUserAccount): void {
    this.accountDetails = user;
  }

  setSubmittedFormValues(igcfValues: any) {
    this.igcfValues = igcfValues;
  }

  getSubmittedIgcfValues() {
    return this.igcfValues;
  }

  // Assuming you have defined the ISubmittedIGCF interface

  getAllDeptSubmittedIgcf(deptName: string): Observable<ISubmittedIGCF[]> {
    const params = new HttpParams().set('emp_dept', deptName);
    return this.http.get(`${this.apiBaseUrl}/get/all-dept-submitted-igcf`, {
      params,
    }) as Observable<ISubmittedIGCF[]>;
  }
  getUserSubmittedIgcf(emp_number: string): Observable<ISubmittedIGCF[]> {
    const params = new HttpParams().set('emp_number', emp_number);
    return this.http.get(`${this.apiBaseUrl}/get/emp-submitted-igcf`, {
      params,
    }) as Observable<ISubmittedIGCF[]>;
  }
  getAllSubmittedIgcfInEverydept() {
    return this.http.get(
      `${this.apiBaseUrl}/get/all-emp-submitted-igcf`
    ) as Observable<ISubmittedIGCF[]>;
  }
  signIgcf(info: ISignedIgcf) {
    this.http.post(`${this.apiBaseUrl}/signed-igcf`, info).subscribe({
      next: () => {
        this.authService.openSnackBar(
          'IGCF signed successfully',
          'Close',
          'bottom'
        );
        this.routerService.routeTo('dashboard');
      },
      error: (error) => {
        this.authService.openSnackBar(
          'Error signing IGCF: ' + error.message,
          'Close',
          'bottom'
        );
        this.routerService.routeTo('dashboard');
      },
    });
  }

  private getUserAccountDetails(): IUserAccount {
    return this.accountDetails;
  }

  submitForm() {
    this.http
      .post(`${this.apiBaseUrl}/submit-form`, this.getSubmittedIgcfValues())
      .subscribe({
        next: (response: any) => {
          this.authService.openSnackBar(response.message, 'Close', 'bottom');
          this.routerService.routeTo('dashboard');
        },
        error: (error) => {
          console.error(error);
          this.authService.openSnackBar(
            'Error submitting form. Please try again later.',
            'Close',
            'bottom'
          );
          this.routerService.routeTo('dashboard');
        },
      });
  }

  addIGCFInformation(newIgcfPercentages: any): void {
    this.http
      .post(`${this.apiBaseUrl}/percentages/add`, newIgcfPercentages)
      .subscribe({
        next: () => {
          this.authService.openSnackBar('Successfull', 'Close', 'bottom');
          this.routerService.routeTo('dashboard');
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  addEmployeeDetails(): void {
    this.http
      .post(
        `${this.apiBaseUrl}/employee-details/add`,
        this.getEmployeeDetails()
      )
      .subscribe(
        () => {
          this.authService.openSnackBar(
            'Employee Created Successfully',
            'Close',
            'bottom'
          );
        },
        (error) => {
          console.error('Error registering personal:', error);
          // Handle the error, e.g., show an error message to the user
          this.authService.openSnackBar(
            'Failed to create employee details.',
            'Close',
            'bottom'
          );
        }
      );
  }

  addUserAccount() {
    this.http
      .post(`${this.apiBaseUrl}/user/register`, this.getUserAccountDetails())
      .subscribe(
        () => {
          this.authService.openSnackBar(
            'Successfully Created User Account',
            'Close',
            'bottom'
          );
        },
        (error) => {
          console.error('Error registering personal:', error);
          this.authService.openSnackBar(
            'Failed to create user account.',
            'Close',
            'bottom'
          );

          // Handle the error, e.g., show an error message to the user
        }
      );
  }

  setUnconfirmedEmail(email: string): void {
    this.unconfirmedEmail = email;
  }

  private getUnconfirmedEmail(): string {
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
