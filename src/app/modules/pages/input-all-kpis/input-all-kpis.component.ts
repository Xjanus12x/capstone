import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/services/auth.service';
import { BackendService } from 'src/app/core/services/backend.service';
import { ReviewKpisComponent } from '../../components/review-kpis/review-kpis.component';

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
  toppings = new FormControl('');

  responsibleList: string[] = [
    'Dean',
    'Chair',
    'Faculty',
    'CEB',
    'Organizations',
    'Lab',
    'Staff',
    'GPC',
    'OBE Facilitator',
  ];
  selected = new FormControl(0);

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
      actionPlans: this.fb.array([
        this.createActionPlanControl(), // Add initial action plan control
      ]),
    });
  }

  addTab(selectAfterAdding: boolean) {
    const kpisArray = this.formGroup.get('kpis') as FormArray;
    if (selectAfterAdding) {
      this.selected.setValue(kpisArray.length);
    }
    this.addKPIControl();
  }

  removeTab(index: number) {
    // this.tabs.splice(index, 1);
    const kpisArray = this.formGroup.get('kpis') as FormArray;
    if (kpisArray.length > 1 && index >= 0 && index < kpisArray.length) {
      kpisArray.removeAt(index);
    }
  }

  getTabsLength() {
    return (this.formGroup.get('kpis') as FormArray).length;
  }

  addNewActionPlan(kpiIndex: number): void {
    const actionPlansArray = this.getActionPlansControls(kpiIndex);
    actionPlansArray.push(this.createActionPlanControl());
  }

  createActionPlanControl(): FormGroup {
    return this.fb.group({
      plan: ['', [Validators.required, Validators.minLength(5)]],
      weight: [
        '',
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      responsible: ['', Validators.required],
    });
  }
  removeActionPlan(kpiIndex: number, actionPlanIndex: number): void {
    const actionPlansArray = this.getActionPlansControls(kpiIndex);
    actionPlansArray.removeAt(actionPlanIndex);
  }
  isOnlyOneActionPlan(kpiIndex: number): boolean {
    const actionPlansArray = this.getActionPlansControls(kpiIndex);
    return actionPlansArray.length === 1;
  }

  getActionPlansControls(kpiIndex: number): FormArray {
    const kpiControl = this.getKPIControl(kpiIndex);
    return kpiControl.get('actionPlans') as FormArray;
  }

  getKPIControl(index: number): FormGroup {
    const kpisArray = this.formGroup.get('kpis') as FormArray;
    return kpisArray.at(index) as FormGroup;
  }

  // Function to get a specific action plan control within a form group or form array
  getActionPlanControl(
    kpiIndex: number,
    actionPlanIndex: number,
    controlName: string
  ): AbstractControl {
    const actionPlansArray = this.getActionPlansControls(kpiIndex);
    const actionPlanGroup = actionPlansArray.at(actionPlanIndex) as FormGroup;
    return actionPlanGroup.get(controlName) as AbstractControl;
  }

  // personInCharge: [
  //   '',
  //   [Validators.required, Validators.min(1), Validators.max(100)],
  // ],
  addKPIControl(): void {
    const kpisArray = this.formGroup.get('kpis') as FormArray;
    kpisArray.push(this.createKPIControl());
  }
  // addNewActionPlan(): void {
  //   const actionPlansArray = this.formGroup.get('actionPlans') as FormArray;
  //   actionPlansArray.push(this.createActionPlanControl());
  // }

  removeKPIControl(): void {
    const kpisArray = this.formGroup.get('kpis') as FormArray;
    if (kpisArray.length > 1) {
      kpisArray.removeAt(kpisArray.length - 1);
    }
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
  // getFormArrayControlsTest(index: number) {
  //   return (this.formGroup.get('kpis') as FormArray)[index].controls;
  // }
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
    const kpiAndActionPlans: any[] = [];
    kpisArray.controls.forEach((kpiControl: AbstractControl) => {
      const title = kpiControl.get('kpititle')?.value;
      const actionPlansArray = (kpiControl as FormGroup).get(
        'actionPlans'
      ) as FormArray;
      actionPlansArray.controls.forEach(
        (actionPlanControl: AbstractControl) => {
          const actionPlans = actionPlanControl as FormGroup;
          const responsible = actionPlans.get('responsible')?.value.join(',');
          kpiAndActionPlans.push({
            title,
            ...actionPlans.value,
            responsible: responsible,
          });
        }
      );
    });
    const dialogRef = this.dialog.open(ReviewKpisComponent, {
      data: this.formGroup.get('kpis')?.value,
      minWidth: '1000px',
    });
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) this.backendService.submitKpis(kpiAndActionPlans);
      },
    });
  }
}
