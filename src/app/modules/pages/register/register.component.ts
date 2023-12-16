import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ViewChild,
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
import { IEmployeeDetails } from '../../../core/models/EmployeeDetails';
import { IUserAccount } from '../../../core/models/UserAccount';
import { BackendService } from 'src/app/core/services/backend.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../../components/dialog-box/dialog-box.component';
import { IDeactivateComponent } from 'src/app/core/models/DeactivateComponent';
import { Observable, map } from 'rxjs';
import { createExitConfirmationDialogConfig } from 'src/app/shared/utils/confirmation-dialog-config';
import { removeLeadingAndTrailingSpaces } from 'src/app/shared/utils/removeLeadingAndTrailingSpaces';
import { Router } from '@angular/router';
import { emailExistenceValidator } from 'src/app/core/Validators/emailExistenceValidator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements AfterViewInit, IDeactivateComponent {
  registrationFormGroup!: FormGroup;
  roles: string[] = ['Admin', 'Regular', 'Viewer Only'];
  departments: string[] = ['dept1', 'dept2', 'dept3', 'dept4'];

  signature: string = '';

  @ViewChild('signature')
  public signaturePad!: SignaturePadComponent;
  constructor(
    private _formBuilder: FormBuilder,
    private backendService: BackendService,
    public dialog: MatDialog,
    private router: Router
  ) {
    const emailPattern = /^.*[a-zA-Z]@hau\.edu\.ph[^0-9]$/;
    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)/;

    this.registrationFormGroup = this._formBuilder.group({
      personalInformationFormGroup: this._formBuilder.group({
        emp_firstName: ['', Validators.required],
        emp_lastName: ['', Validators.required],
        emp_number: ['', Validators.required],
        emp_department: ['', Validators.required],
        emp_position: ['', Validators.required],
      }),
      userAccountFormGroup: this._formBuilder.group({
        email: [
          '',
          {
            validators: [
              Validators.required,
              Validators.pattern(passwordPattern),
            ],
            asyncValidators: [emailExistenceValidator(this.backendService)],
            // updateOn: 'blur', // or 'change' based on your preference
          },
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(passwordPattern),
          ],
        ],
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

  register(): void {
    const personalInformationData: IEmployeeDetails = {
      ...this.getPersonalInformationData(),
      emp_signature: this.signature, // Use the updated signature value
    };
    const userAccountData: IUserAccount = this.getUserAccountData();

    removeLeadingAndTrailingSpaces(personalInformationData);
    removeLeadingAndTrailingSpaces(userAccountData);

    if (this.isAllInputFilled()) {
      this.backendService.setEmployeeDetails(personalInformationData);
      this.backendService.setUserAccountDetails(userAccountData);
      this.backendService.registerUser();
      this.router.navigateByUrl('/dashboard');
      return;
    }

    const dialogConfig = createExitConfirmationDialogConfig(
      'Incomplete Registration',
      'Please fill in all the required information before registering.',
      [
        {
          isVisible: false,
          matDialogCloseValue: false,
          content: '',
          tailwindClass: '',
        },
        {
          isVisible: true,
          matDialogCloseValue: true,
          content: 'Ok',
          tailwindClass: 'text-red-500',
        },
      ]
    );

    this.dialog.open(DialogBoxComponent, dialogConfig);
  }

  // Helper function to check if all form controls have a value
  areAllControlsFilled(formGroup: FormGroup): boolean {
    for (const controlName in formGroup.controls) {
      const control = formGroup.controls[controlName];

      // If it's a nested FormGroup, recursively check its controls
      if (control instanceof FormGroup) {
        if (!this.areAllControlsFilled(control)) {
          return false;
        }
      } else {
        // Check if the control has a value
        if (control.value === '' || control.value === null) {
          return false;
        }
      }
    }

    return true;
  }
  isAllInputFilled(): boolean {
    return (
      this.areAllControlsFilled(this.registrationFormGroup) && !!this.signature
    );
  }

  canExit(): boolean | Promise<boolean> | Observable<boolean> {
    if (this.isAllInputFilled()) return true; // Allow navigation

    const dialogConfig = createExitConfirmationDialogConfig(
      'Confirm Exit',
      'Are you sure you want to exit? Your registration information is incomplete.',
      [
        {
          isVisible: true,
          matDialogCloseValue: false,
          content: 'No',
          tailwindClass: 'text-red-500',
        },
        {
          isVisible: true,
          matDialogCloseValue: true,
          content: 'Yes',
          tailwindClass: 'text-red-500',
        },
      ]
    );
    const dialogRef = this.dialog.open(DialogBoxComponent, dialogConfig);

    return dialogRef.afterClosed().pipe(
      map((result) => {
        return result || false; // If result is undefined, treat it as "No"
      })
    );
  }
}
