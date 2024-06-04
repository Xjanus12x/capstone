import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  AsyncValidatorFn,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  NgSignaturePadOptions,
  SignaturePadComponent,
} from '@almothafar/angular-signature-pad';
import { IUserAccount } from '../../../core/models/UserAccount';
import { BackendService } from 'src/app/core/services/backend.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../../components/dialog-box/dialog-box.component';
import { IDeactivateComponent } from 'src/app/core/models/DeactivateComponent';
import { Observable, debounceTime, map } from 'rxjs';
import { removeLeadingAndTrailingSpaces } from 'src/app/shared/utils/removeLeadingAndTrailingSpaces';
import { Router } from '@angular/router';
import { emailExistenceValidator } from 'src/app/core/Validators/emailExistenceValidator';
import { IDialogBox } from 'src/app/core/models/DialogBox';
import { departmentNamesMap } from 'src/app/core/constants/DepartmentData';
import { IPendingUser } from 'src/app/core/models/PendingUser';
import { confirmPasswordValidator } from 'src/app/core/Validators/confirmPasswordValidator';
import { employeeNumberExistenceValidator } from 'src/app/core/Validators/employeeNumberExistenceValidator';
import * as bcrypt from 'bcryptjs';
import { validateHauEmployee } from 'src/app/core/Validators/hauEmployeeByEmpNumberValidator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit, IDeactivateComponent {
  // To be use somewhere
  //   signature: string = '';
  // @ViewChild('signature')
  // public signaturePad!: SignaturePadComponent;
  // ngAfterViewInit() {
  //   // this.signaturePad is now available
  //   this.signaturePad.set('minWidth', 5); // set szimek/signature_pad options at runtime
  //   this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
  // }
  // drawStart(event: MouseEvent | Touch) {
  //   // will be notified of szimek/signature_pad's onBegin event
  //   console.log('Start drawing', event);
  // }
  // drawComplete(event: MouseEvent | Touch) {
  //   this.signature = this.signaturePad.toDataURL();
  // }
  // clear() {
  //   this.signaturePad.clear();
  //   this.signature = '';
  // }
  // signaturePadOptions: NgSignaturePadOptions = {
  //   // passed through to szimek/signature_pad constructor
  //   minWidth: 1,
  //   canvasWidth: 450,
  //   canvasHeight: 200,
  //   backgroundColor: 'white',
  //   dotSize: 1,
  //   maxWidth: 2,
  // };

  registrationFormGroup!: FormGroup;
  roles: string[] = ['Admin', 'Faculty', 'HRD', 'College Secretary'];
  departments: string[] = Array.from(departmentNamesMap.keys());
  dialogBoxConfig = {
    width: '300px',
    enterAnimationDuration: '200ms',
    exitAnimationDuration: '400ms',
  };
  isLoading: boolean = false;
  isSamePassword: boolean = false;
  saltRounds: number = 12;
  registrationType: string = '';
  private hauEmployeeDetails: any[] = [];
  constructor(
    private _formBuilder: FormBuilder,
    private backendService: BackendService,
    public dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // const emailPattern = /^.*[a-zA-Z]@hau\.edu\.ph[^0-9]$/;
    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)/;

    this.registrationFormGroup = this._formBuilder.group({
      personalInformationFormGroup: this._formBuilder.group({
        emp_firstName: ['', Validators.required],
        emp_lastName: ['', Validators.required],
        emp_number: [
          '',
          {
            validators: [Validators.required],
            asyncValidators: [
              employeeNumberExistenceValidator(this.backendService),
            ],
            updateOn: 'blur',
          },
        ],
        emp_dept: ['', Validators.required],
        // emp_position: ['', Validators.required],
      }),
      userAccountFormGroup: this._formBuilder.group({
        email: [
          '',
          {
            validators: [Validators.required, Validators.email],
            asyncValidators: [emailExistenceValidator(this.backendService)],
            updateOn: 'blur',
          },
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(1),
            Validators.pattern(passwordPattern),
          ],
        ],
        // confirm_password: ['', [Validators.required]],
        role: ['', Validators.required],
      }),
    });

    // const confirmPasswordControl = this.getFormControl(
    //   'userAccountFormGroup',
    //   'confirm_password'
    // );

    // confirmPasswordControl.valueChanges
    //   .pipe(
    //     debounceTime(300) // Add a delay of 500 milliseconds
    //   )
    //   .subscribe((value) => {
    //     const password = this.getFormControl(
    //       'userAccountFormGroup',
    //       'password'
    //     ).value;
    //     this.isSamePassword = !(password === value);
    //     console.log(!(password === value));
    //     console.log(password, value);
    //   });
  }
  ngOnInit() {
    this.backendService.fetchHauEmployeeDetails().subscribe({
      next: (data) => {
        this.hauEmployeeDetails = data;    
      },
      error: () => {
        this.hauEmployeeDetails = [];
      },
    });
  }

  setRegistrationType(registrationType: string) {
    this.registrationType = registrationType;
    // Check if we should apply or remove the async validator
    if (this.registrationType === 'byEmpNumber') {
      this.getFormControl(
        'personalInformationFormGroup',
        'emp_number'
      ).addValidators(validateHauEmployee( this.hauEmployeeDetails));
    } else {
      this.getFormControl(
        'personalInformationFormGroup',
        'emp_number'
      ).removeValidators(validateHauEmployee(this.hauEmployeeDetails));
    }

    // Trigger re-validation
    this.getFormControl(
      'personalInformationFormGroup',
      'emp_number'
    ).updateValueAndValidity();
  }

  getRegistrationType() {
    return this.registrationType;
  }

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
    const emp_number = this.registrationFormGroup
      .get('personalInformationFormGroup')
      ?.get('emp_number')?.value;
    return {
      ...this.registrationFormGroup.get('userAccountFormGroup')?.value,
      emp_number,
    };
  }

  register(): void {
    if (this.isAllInputFilled()) {
      this.isLoading = true; // Set loading flag to true before making the registration call
      const password = this.registrationFormGroup.get(
        'userAccountFormGroup.password'
      )?.value;
      bcrypt.hash(password, this.saltRounds, (err: any, hash: any) => {
        if (err) {
          console.error('Error hashing password:', err);
          return;
        }
        // Create the pending user object with the hashed password
        const pendingUser: IPendingUser = {
          ...this.registrationFormGroup.get('userAccountFormGroup')?.value,
          ...this.registrationFormGroup.get('personalInformationFormGroup')
            ?.value,
          password: hash, // Store the hashed password in the pending user object
        };

        removeLeadingAndTrailingSpaces(pendingUser);

        this.backendService
          .firebaseAddPendingRegistration(pendingUser)
          .subscribe({
            next: () => {
              const dialogBoxData = {
                title: 'Registration Successful',
                content:
                  'Pending user account created successfully. It needs to be approved before login.',
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
              this.router.navigate(['/login']); // Navigate to login page
            },
            error: (err) => {
              const dialogBoxData = {
                title: 'Registration Failed',
                content:
                  'An error occurred while processing your registration. Please try again later.',
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
              this.router.navigate(['/login']); // Navigate to login page
            },
            complete: () => {
              this.isLoading = false;
              this.cdr.detectChanges(); // Trigger change detection
            },
          });
      });
    } else {
      const dialogBoxData = {
        title: 'Incomplete Registration',
        content:
          'Please fill in all the required information before registering.',
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
  }

  isAllInputFilled(): boolean {
    // return this.registrationFormGroup.valid && this.isSamePassword;
    return this.registrationFormGroup.valid;
  }

  canExit(): boolean | Promise<boolean> | Observable<boolean> {
    if (this.isAllInputFilled()) return true; // Allow navigation

    const dialogBoxData: IDialogBox = {
      title: 'Confirm Exit',
      content:
        'Are you sure you want to exit? Your registration information is incomplete.',
      buttons: [
        {
          isVisible: true,
          matDialogCloseValue: false,
          content: 'No',
        },
        {
          isVisible: true,
          matDialogCloseValue: true,
          content: 'Yes',
        },
      ],
    };

    const dialogRef = this.dialog.open(DialogBoxComponent, {
      ...this.dialogBoxConfig,
      data: dialogBoxData,
    });

    return dialogRef.afterClosed().pipe(
      map((result) => {
        return result || false; // If result is undefined, treat it as "No"
      })
    );
  }
}
