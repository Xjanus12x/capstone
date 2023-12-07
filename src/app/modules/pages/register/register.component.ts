import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import {
  NgSignaturePadOptions,
  SignaturePadComponent,
} from '@almothafar/angular-signature-pad';
import { ErrorStateMatcher } from '@angular/material/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { IEmployeeDetails } from '../../../core/models/EmployeeDetails';
import { IUserAccount } from '../../../core/models/UserAccount';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/core/services/backend.service';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements AfterViewInit, OnInit {
  registrationFormGroup!: FormGroup;

  apiBaseUrl = 'http://localhost:8085/api';
  roles: string[] = ['Admin', 'Regular', 'Viewer Only'];
  departments: string[] = ['dept1', 'dept2', 'dept3', 'dept4'];
  signature: string = '';
  // details$: Observable<IEmployeeDetails[]> = new Observable();

  @ViewChild('signature')
  public signaturePad!: SignaturePadComponent;
  constructor(
    private _formBuilder: FormBuilder,
    private http: HttpClient,
    private backendService: BackendService
  ) {
    this.registrationFormGroup = this._formBuilder.group({
      personalInformationFormGroup: this._formBuilder.group({
        emp_firstName: ['', Validators.required],
        emp_lastName: ['', Validators.required],
        emp_number: ['', Validators.required],
        emp_department: ['', Validators.required],
        emp_position: ['', Validators.required],
      }),
      userAccountFormGroup: this._formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        role: ['', Validators.required],
      }),
    });
  }
  signaturePadOptions: NgSignaturePadOptions = {
    // passed through to szimek/signature_pad constructor
    minWidth: 1,
    canvasWidth: 450,
    canvasHeight: 200,
    backgroundColor: 'white',
    dotSize: 1,
    maxWidth: 2,
  };
  ngOnInit() {
    // this.getAllEmployeesDetails();
  }

  // details: IEmployeeDetails[] = [];
  // loadEmployeeDetails(): void {
  //   this.backendService.getAllEmployeesDetails().subscribe(
  //     (resultData: any) => {
  //       this.details = resultData.data;
  //       console.log(this.details);
  //     },
  //     (error) => {
  //       console.error('Error fetching data:', error);
  //       // Handle the error, e.g., show an error message to the user
  //     }
  //   );
  // }

  details!: any[];

  loadEmployeeDetails(): void {
    this.backendService.getAllEmployeesDetails().subscribe(
      (response: HttpResponse<any>) => {
        if (response.body) {
          console.log(response.body); // Log the entire response body
          this.details = response.body.data; // Adjust the property based on your response structure
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
        // Handle the error, e.g., show an error message to the user
      }
    );
  }
  ngAfterViewInit() {
    // this.signaturePad is now available
    this.signaturePad.set('minWidth', 5); // set szimek/signature_pad options at runtime
    this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
  }

  drawStart(event: MouseEvent | Touch) {
    // will be notified of szimek/signature_pad's onBegin event
    console.log('Start drawing', event);
  }
  drawComplete(event: MouseEvent | Touch) {
    this.signature = this.signaturePad.toDataURL();
  }
  clear() {
    this.signaturePad.clear();
    this.signature = '';
  }
  redo() {}

  getFormGroup(formGroup: string) {
    return this.registrationFormGroup.get(formGroup) as FormGroup;
  }

  getFormControl(formGroup: string, formControl: string) {
    return this.getFormGroup(formGroup).get(formControl) as FormControl;
  }

  getPersonalInformationData() {
    return this.registrationFormGroup.get('personalInformationFormGroup')
      ?.value;
  }

  getUserAccountData(): IUserAccount {
    return this.registrationFormGroup.get('userAccountFormGroup')?.value;
  }

  // getAllEmployeesDetails(): void {
  //   this.http.get(`${this.apiBaseUrl}/employee-details`).subscribe(
  //     (resultData: any) => {
  //       this.details = resultData.data;
  //       console.log(this.details);
  //     },
  //     (error) => {
  //       console.error('Error fetching data:', error);
  //       // Handle the error, e.g., show an error message to the user
  //     }
  //   );
  // }

  // Inside your component class
  // details$!: Observable<IEmployeeDetails[]>;
  // employeeDetails: IEmployeeDetails[] = [];
  // ...

  // In a method where you want to use the data
  // loadEmployeeDetails(): void {
  //   this.details$ = this.backendService.getAllEmployeesDetails();
  //   // No need to manually subscribe here
  //   // The async pipe in the template will handle the subscription
  // }

  register(): void {
    const personalInformationData: IEmployeeDetails = {
      ...this.getPersonalInformationData(),
      emp_signature: this.signature, // Use the updated signature value
    };
    const userAccountData: IUserAccount = this.getUserAccountData();

    console.log(personalInformationData);
    this.backendService.setEmployeeDetails(personalInformationData);
    this.backendService.setUserAccountDetails(userAccountData);
    this.backendService.registerUser();
  }

  matcher = new MyErrorStateMatcher();
  // In your component class
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}
