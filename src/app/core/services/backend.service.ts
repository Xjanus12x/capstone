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
import { IPendingUser } from '../models/PendingUser';
import { IIGCFSubmission } from '../models/IGCFSubmission';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  // Define the base API URL
  private apiBaseUrl = 'http://localhost:8085/api';
  // private apiBaseUrl: string = 'https://haucommit.com/api';

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

  rateIgcf(data: any) {
    return this.http.post<any>(`${this.apiBaseUrl}/update/rate-igcf`, data);
  }

  submitIGCF(data: any) {
    return this.http.post(`${this.apiBaseUrl}/submit-igcf`, data);
  }

  getSubmissionHistoryByDept(dept: string) {
    const params = new HttpParams().set('dept', dept);
    return this.http.get(
      `${this.apiBaseUrl}/get/igcf-submission-history-by-dept`,
      {
        params,
      }
    );
  }
  getSubmissionHistoryByEmployeeNumber(empNumber: string) {
    const params = new HttpParams().set('emp_number', empNumber);
    return this.http.get(
      `${this.apiBaseUrl}/get/igcf-submission-history-by-emp-num`,
      {
        params,
      }
    );
  }
  getSubmissionHistoryEveryDept() {
    return this.http.get(
      `${this.apiBaseUrl}/get/igcf-submission-history-every-dept`
    );
  }

  getSubmittedIgcfDetails(id: string) {
    const params = new HttpParams().set('id', id);
    return this.http.get(`${this.apiBaseUrl}/get/submitted-igcf-details`, {
      params,
    });
  }
  getSubmittedIgcfPartTwo(id: string) {
    const params = new HttpParams().set('id', id);
    return this.http.get(`${this.apiBaseUrl}/get/igcf-part-two`, {
      params,
    });
  }
  getSubmittedIgcfPartTwoByDept(dept: string) {
    const params = new HttpParams().set('dept', dept);
    return this.http.get(`${this.apiBaseUrl}/get/igcf-part-two-by-dept`, {
      params,
    });
  }

  submitKpis(kpis: any[]) {
    this.http
      .post<any>(`${this.apiBaseUrl}/add/kpi-and-action-plans`, kpis)
      .subscribe({
        next: () => {
          // Handle success
          this.authService.openSnackBar(
            'KPIs submitted successfully',
            'Close',
            'bottom'
          );
          this.routerService.routeTo('dashboard');
        },
        error: (error) => {
          // Handle error
          console.error('Error submitting KPIs:', error);
          this.authService.openSnackBar(
            'Failed to submit KPIs',
            'Close',
            'bottom'
          );
          this.routerService.routeTo('dashboard');
        },
      });
  }

  getKpisAndActionPlans(dept: string): Observable<any> {
    const params = new HttpParams().set('dept', dept); // Convert id to string
    return this.http.get<any[]>(`${this.apiBaseUrl}/get/kpi-and-action-plans`, {
      params,
    });
  }

  deleteKPIAndActionPlan(id: number) {
    const params = new HttpParams().set('id', id.toString()); // Convert id to string
    return this.http.delete(`${this.apiBaseUrl}/delete/kpi-and-action-plan`, {
      params,
      responseType: 'text', // Set response type to text to prevent JSON parsing
    });
  }

  submitActionPlans(actionPlans: any[]) {
    this.http
      .post<any>(`${this.apiBaseUrl}/submit-action-plans`, actionPlans)
      .subscribe({
        next: () => {
          // Handle success
          this.authService.openSnackBar(
            'Action Plans submitted successfully',
            'Close',
            'bottom'
          );
          this.routerService.routeTo('dashboard');
        },
        error: (error) => {
          // Handle error
          console.error('Error submitting KPIs:', error);
          this.authService.openSnackBar(
            'Failed to submit Action Plans',
            'Close',
            'bottom'
          );
          this.routerService.routeTo('dashboard');
        },
      });
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

  deletePendingUser(id: number) {
    return this.http.delete<any>(`${this.apiBaseUrl}/del/pending-user/${id}`);
  }
  updatePendingUser(data: any) {
    return this.http.post(`${this.apiBaseUrl}/update/pending-user`, data);
  }
  acceptPendingUser(data: any): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/add/accept-pending-user`, data);
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

  addPendingRegistration(userCredentials: IPendingUser) {
    this.http
      .post(`${this.apiBaseUrl}/add/pending-registration`, userCredentials)
      .subscribe(
        () => {
          this.authService.openSnackBar(
            'Pending user account created successfully. It needs to be approved before login.',
            'Close',
            'bottom'
          );
          this.routerService.routeTo('login');
        },
        (error) => {
          console.error('Failed to create pending user account:', error);
          this.authService.openSnackBar(
            'Failed to create pending user account.',
            'Close',
            'bottom'
          );
          this.routerService.routeTo('login');

          // Handle the error, e.g., show an error message to the user
        }
      );
  }

  getPendingUsers(dept: string): Observable<any> {
    const params = new HttpParams().set('dept', dept);
    return this.http.get(`${this.apiBaseUrl}/get/pending-users`, {
      params,
    }) as Observable<IPendingUser[]>;
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
