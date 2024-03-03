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
@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css'],
})
export class UpdateUserComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private backendService: BackendService,
    @Inject(MAT_DIALOG_DATA) public data: IUserList
  ) {}
  updateUser!: FormGroup;
  signature: string = '';
  roles: string[] = ['Admin', 'Regular', 'Viewer Only'];
  departments: string[] = ['dept1', 'dept2', 'dept3', 'dept4'];
  @ViewChild('signature')
  public signaturePad!: SignaturePadComponent;

  ngOnInit(): void {
    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)/;
    const {
      emp_firstname,
      emp_lastname,
      emp_number,
      emp_role,
      emp_dept,
      emp_position,
    } = this.data;

    this.updateUser = this.fb.group({
      firstname: [
        emp_firstname,
        [Validators.required, notOnlySpacesValidator()],
      ],
      lastname: [emp_lastname, [Validators.required, notOnlySpacesValidator()]],
      emp_number: [emp_number, [Validators.required, notOnlySpacesValidator()]],
      role: [emp_role, [Validators.required]],
      dept: [emp_dept, [Validators.required]],
      position: [emp_position, [Validators.required, notOnlySpacesValidator()]],
    });
  }
  getFormControlError(controlName: string, errorName: string) {
    return this.updateUser.get(controlName)?.hasError(errorName);
  }
  getFormControl(controlName: string) {
    return this.updateUser.get(controlName);
  }
}
