import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendService } from 'src/app/core/services/backend.service';
import {
  NgSignaturePadOptions,
  SignaturePadComponent,
} from '@almothafar/angular-signature-pad';
import { IUserList } from 'src/app/core/models/UsersList';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { notOnlySpacesValidator } from 'src/app/core/Validators/notOnlySpacesValidator';
import { emailExistenceValidator } from 'src/app/core/Validators/emailExistenceValidator';
import { IPendingUser } from 'src/app/core/models/PendingUser';
import { departmentNamesMap } from 'src/app/core/constants/DepartmentData';
@Component({
  selector: 'app-update-pending-user',
  templateUrl: './update-pending-user.component.html',
  styleUrls: ['./update-pending-user.component.css'],
})
export class UpdatePendingUserComponent {
  constructor(
    private fb: FormBuilder,
    private backendService: BackendService,
    @Inject(MAT_DIALOG_DATA) public data: IPendingUser
  ) {}
  updatePendingUser!: FormGroup;
  signature: string = '';
  roles: string[] = ['Admin', 'Faculty', 'HRD', 'College Secretary'];
  departments: string[] = Array.from(departmentNamesMap.keys());
  responsibles: string[] = [
    'Dean',
    'Chair',
    'Faculty',
    'CEB',
    'Organizations',
    'Lab',
    'Staff',
    'GPC',
    'OBE Facilitator',
    'Practicum',
    'Coor',
  ];
  ngOnInit(): void {
    const {
      emp_firstname,
      emp_lastname,
      role,
      emp_number,
      emp_dept,
      // emp_position,
    } = this.data;

    this.updatePendingUser = this.fb.group({
      firstname: [
        emp_firstname,
        [Validators.required, notOnlySpacesValidator()],
      ],
      lastname: [emp_lastname, [Validators.required, notOnlySpacesValidator()]],
      emp_number: [emp_number, [Validators.required, notOnlySpacesValidator()]],
      role: [role, [Validators.required]],
      dept: [emp_dept, [Validators.required]],
      // position: [emp_position, [Validators.required, notOnlySpacesValidator()]],
    });
  }
  getFormControlError(controlName: string, errorName: string) {
    return this.updatePendingUser.get(controlName)?.hasError(errorName);
  }

  getFormControl(controlName: string) {
    return this.updatePendingUser.get(controlName);
  }
}
