import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/services/auth.service';
import { BackendService } from 'src/app/core/services/backend.service';

@Component({
  selector: 'app-input-all-kpis',
  templateUrl: './input-all-kpis.component.html',
  styleUrls: ['./input-all-kpis.component.css'],
})
export class InputAllKpisComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public dialog: MatDialog,
    private backendService: BackendService
  ) {}
  formGroup!: FormGroup;
  currentUserDept: string = '';
  ngOnInit(): void {
    this.authService.getEmployeeDepartment().subscribe({
      next: (dept: string) => {
        this.currentUserDept = dept;
      },
    });
    this.formGroup = this.fb.group({
      kpis: this.fb.array([this.createKPIControl()]),
    });
  }
  createKPIControl(): FormGroup {
    return this.fb.group({
      kpititle: ['', [Validators.required, Validators.minLength(5)]],
      weight: [
        '',
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
    });
  }
  addKPIControl(): void {
    const kpisArray = this.formGroup.get('kpis') as FormArray;
    kpisArray.push(this.createKPIControl());
  }

  removeKPIControl(index: number): void {
    const kpisArray = this.formGroup.get('kpis') as FormArray;
    kpisArray.removeAt(index);
  }

  // Function to get a specific form control within a form group or form array
  getFormControl(
    groupName: string,
    controlName: string,
    index?: number
  ): AbstractControl | null {
    const group = this.formGroup.get(groupName);
    if (!group) {
      return null;
    }

    if (index !== undefined) {
      const arrayControl = group as FormArray;
      const control = arrayControl.at(index).get(controlName);
      return control;
    } else {
      return group.get(controlName);
    }
  }
  // Function to get controls of a FormArray
  getFormArrayControls() {
    return (this.formGroup.get('kpis') as FormArray).controls;
  }

  submit() {
    const kpisArray = this.formGroup.get('kpis') as FormArray;

    // Check if the form group is invalid
    if (this.formGroup.invalid) {
      this.authService.openSnackBar(
        'Please fill out all required fields before submitting the form.',
        'Close',
        'bottom'
      );
      return;
    }

    // Check if the FormArray is empty after removing a control
    if (kpisArray.length === 0) {
      this.authService.openSnackBar(
        'Form cannot be submitted as there are no KPIs added.',
        'Close',
        'bottom'
      );
      return; // Exit the function to prevent further execution
    }

    const values = kpisArray.value.map((kpis: any) => {
      return {
        ...kpis,
        dept: this.currentUserDept,
      };
    });
    // Further logic for form submission
    this.backendService.submitKpis(values);
  }
}
