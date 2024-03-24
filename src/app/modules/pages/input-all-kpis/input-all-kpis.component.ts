import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDateRangePicker } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { RouterService } from '../../services/router-service.service';
import { group } from '@angular/animations';
import { Action } from 'rxjs/internal/scheduler/Action';

@Component({
  selector: 'app-input-all-kpis',
  templateUrl: './input-all-kpis.component.html',
  styleUrls: ['./input-all-kpis.component.css'],
  providers: [DatePipe],
})
export class InputAllKpisComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public dialog: MatDialog,
    private backendService: BackendService,
    private datePipe: DatePipe,
    private routerService: RouterService
  ) {}
  @ViewChild(MatDatepicker) datepicker!: MatDatepicker<Date>;
  @ViewChild('datepickerInput') datepickerInput!: ElementRef<HTMLInputElement>;
  formGroup: FormGroup = this.fb.group({});
  currentUserDept: string = '';
  isEffectivityGroupValid: boolean = false;
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
    'Practicum',
    'Coor'
  ];
  // Temp
  //   createTargetFormGroup() {
  //   return this.fb.group({
  //     target_weight: [
  //       '',
  //       [
  //         Validators.required,
  //         Validators.pattern(/^[0-9\.>=<=%]+$/),
  //         Validators.min(1), // Example: ensure it's at least 1
  //       ],
  //     ],
  //     target_year_start: ['', Validators.required],
  //     target_year_end: ['', Validators.required],
  //   });
  // }
  selected = new FormControl(0);
  minDate: Date = new Date(); // Set the minimum selectable date to the current date

  ngOnInit(): void {
    this.authService.getEmployeeDepartment().subscribe({
      next: (dept: string) => {
        this.currentUserDept = dept;
      },
    });

    this.formGroup = this.fb.group({
      effectivity: this.fb.group({
        start: ['', Validators.required],
        end: ['', Validators.required],
      }),
      kpi1: this.createKPIGroup(),
    });
    this.subscribeToEffectivityChanges();
  }

  subscribeToEffectivityChanges(): void {
    const startControl = this.getEffectivityGroup().get('start');
    const endControl = this.getEffectivityGroup().get('end');

    if (startControl && endControl) {
      startControl.valueChanges.subscribe(() => {
        this.updateEffectivityValidity();
      });

      endControl.valueChanges.subscribe(() => {
        this.updateEffectivityValidity();
      });
    }
  }
  updateEffectivityValidity(): void {
    const start = this.getEffectivityGroup().get('start')?.value;
    const end = this.getEffectivityGroup().get('end')?.value;

    if (start && end) {
      const yearsDiff = Math.abs(end.getFullYear() - start.getFullYear());
      this.isEffectivityGroupValid = yearsDiff === 4;
    } else {
      this.isEffectivityGroupValid = false;
    }
  }

  getFormGroupNames(): string[] {
    return Object.keys(this.formGroup.value);
  }

  getActionPlanFormArray(groupName: string): FormArray {
    return this.formGroup.get(groupName)?.get('actionPlan') as FormArray;
  }

  getEffectivityGroup(): FormGroup {
    return this.formGroup.get('effectivity') as FormGroup;
  }

  createKPIGroup(): FormGroup {
    const kpiGroup = this.fb.group({
      kpi_title: ['', [Validators.required]],
      actionPlan: this.fb.array([]),
    });
    return kpiGroup;
  }

  addKPI(selectAfterAdding: boolean) {
    const groupNames = this.getFormGroupNames();
    const formGroupLength = groupNames.length - 1;
    const groupName = `kpi${formGroupLength + 1}`;

    if (!groupNames.includes(groupName)) {
      this.formGroup.addControl(
        `kpi${formGroupLength + 1}`,
        this.createKPIGroup()
      );
    } else {
      const matchResult = groupName.match(/\d+/);
      if (matchResult !== null) {
        const number = parseInt(matchResult[0]);
        this.formGroup.addControl(`kpi${number + 1}`, this.createKPIGroup());
      }
    }
    if (selectAfterAdding) {
      this.selected.setValue(formGroupLength);
    }
  }

  addActionPlan(groupName: string): void {
    const start = this.getEffectivityGroup()?.get('start')?.value;
    const end = this.getEffectivityGroup()?.get('end')?.value;

    // Check if start and end dates are valid and 5 years apart
    if (!start || !end || this.getYears().length !== 5) {
      this.authService.openSnackBar(
        'Start and end dates must be exactly 5 years apart.',
        'close',
        'bottom'
      );
      // this.isEffectivityGroupValid = false;
      return;
    }
    // this.isEffectivityGroupValid = true;
    // Get the form array of action plans inside the specified KPI group
    const actionPlanArray = this.getActionPlanFormArray(groupName);

    // Add new action plans based on the updated start and end dates
    actionPlanArray.push(this.addPlanGroup(start, end));
  }

  addPlanGroup(start: Date, end: Date): FormGroup {
    // Calculate the number of target FormControl elements based on the difference between start and end dates
    const numberOfTargets =
      Math.abs(end.getFullYear() - start.getFullYear()) + 1;

    // Create an array to hold the target FormControl elements
    const targetControls = Array(numberOfTargets)
      .fill('')
      .map(() => {
        return this.fb.control('', [Validators.required]);
      });

    // Create the target FormArray
    const targetArray = this.fb.array(targetControls);

    // Create the plan FormGroup with target FormArray
    return this.fb.group({
      plan: ['', [Validators.required]],
      responsible: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      due_date: ['', [Validators.required]],
      target: targetArray,
    });
  }

  getTargetControls(actionPlan: AbstractControl): AbstractControl[] {
    return (actionPlan.get('target') as FormArray).controls;
  }

  getYears(): number[] {
    const years: number[] = [];
    const startYear = this.getEffectivityGroup()
      ?.get('start')
      ?.value.getFullYear();
    const endYear = this.getEffectivityGroup()?.get('end')?.value.getFullYear();

    for (let i = startYear; i <= endYear; i++) {
      years.push(i);
    }

    return years;
  }

  removeTab(groupName: string): void {
    this.formGroup.removeControl(groupName);
  }

  removePlan(groupName: string, actionPlanIndex: number) {
    const actionPlanArray = this.getActionPlanFormArray(groupName);
    actionPlanArray.removeAt(actionPlanIndex);
  }

  getResponsiblesControl(groupName: string, actionPlanIndex: number) {
    const actionPlanArray = this.getActionPlanFormArray(groupName).at(
      actionPlanIndex
    ) as FormGroup;
    const responsiblesCtrl = actionPlanArray.get('responsible');
    return responsiblesCtrl;
  }

  submit() {
    const kpiValues: any[] = [];
    let groupNames = this.getFormGroupNames();
    // Remove 'effectivity' from the groupNames array
    groupNames = groupNames.filter((name) => name !== 'effectivity');
    console.log(groupNames);

    groupNames.forEach((groupName) => {
      const groupValue = this.formGroup.get(groupName)?.value;
      if (groupValue) {
        const kpiTitle = groupValue.kpi_title.toUpperCase();
        const actionPlans = groupValue.actionPlan;

        Object.entries(actionPlans).forEach(([key, value]: [string, any]) => {
          const { plan, responsible, start_date, due_date, target } = value;
          const responsibles = responsible.join(',');
          const startDateFormatted = this.datePipe.transform(
            start_date,
            'MMMM d, yyyy'
          );
          const dueDateFormatted = this.datePipe.transform(
            due_date,
            'MMMM d, yyyy'
          );
          const targetObj: any = {};

          this.getYears().forEach((value, i) => {
            targetObj[value] = target[i];
          });
          kpiValues.push({
            kpi_title: kpiTitle,
            plan,
            responsibles,
            startDateFormatted,
            dueDateFormatted,
            targets: JSON.stringify(targetObj),
            dept: this.currentUserDept,
          });
        });
      }
    });    
    this.backendService.submitKpis(kpiValues);
  }
}
