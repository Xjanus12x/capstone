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
import { DatePipe } from '@angular/common';
import { RouterService } from '../../services/router-service.service';
import * as _moment from 'moment';
import { MatTabGroup } from '@angular/material/tabs';
import { dialogBoxConfig } from 'src/app/core/constants/DialogBoxConfig';
import { IDialogBox } from 'src/app/core/models/DialogBox';
import { DialogBoxComponent } from '../../components/dialog-box/dialog-box.component';
import { actionPlanExistenceValidator } from 'src/app/core/Validators/ActionPlanExistenceValidator';

const moment = _moment;

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
    'Coor',
  ];
  selected = new FormControl(0);
  minDate: Date = new Date(); // Set the minimum selectable date to the current date
  isLoading: boolean = false;
  isMonthValid: boolean = false;
  previewKpiAndAcntionPlansData: any[] = [];
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  ngOnInit(): void {
    this.currentUserDept =
      this.authService.getUserInformationFirebase().department;

    this.formGroup = this.fb.group({
      effectivity: this.fb.group({
        start: [moment(), Validators.required],
        end: [moment(), Validators.required],
      }),
      kpi1: this.createKPIGroup(),
    });
  }

  getMonth(groupName: string, index: number, controlName: string) {
    const control = this.getActionPlanControl(groupName, index, controlName);
    return new Date(control.value).getMonth();
  }

  getDay(groupName: string, index: number, controlName: string) {
    const control = this.getActionPlanControl(groupName, index, controlName);
    return new Date(control.value).getDay();
  }

  validateMonth(isMonthValid: boolean) {
    return isMonthValid;
  }

  // Function to get a specific action plan control inside the action plan FormArray
  getActionPlanControl(
    groupName: string,
    index: number,
    controlName: string
  ): any {
    const actionPlanArray = this.getActionPlanFormArray(groupName);
    return actionPlanArray.at(index).get(controlName);
  }

  // updateEffectivityValidity(): void {
  //   const startYear =
  //     this.getEffectivityControl('start').value._d.getFullYear();
  //   const endYear = this.getEffectivityControl('end').value._d.getFullYear();
  //   if (startYear && endYear) {
  //     const yearsDiff = Math.abs(endYear - startYear);
  //     this.isEffectivityGroupValid = yearsDiff === 4;
  //   } else {
  //     this.isEffectivityGroupValid = false;
  //   }
  // }

  getFormGroupNames(): string[] {
    return Object.keys(this.formGroup.value);
  }

  getActionPlanFormArray(groupName: string): FormArray {
    return this.formGroup.get(groupName)?.get('actionPlan') as FormArray;
  }

  getEffectivityGroup(): FormGroup {
    return this.formGroup.get('effectivity') as FormGroup;
  }

  getEffectivityControl(controlName: string): any {
    const effectivityGroup = this.formGroup.get('effectivity') as FormGroup;
    return effectivityGroup.get(controlName);
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
    const startYear =
      this.getEffectivityControl('start').value._d.getFullYear();
    const endYear = this.getEffectivityControl('end').value._d.getFullYear();

    // Check if start and end dates are valid and 5 years apart
    if (
      !startYear ||
      !endYear ||
      this.getYears().length < 0 ||
      this.getYears().length !== 5
    ) {
      this.authService.openSnackBar(
        'Start and end year must be exactly 5 years apart.',
        'close',
        'bottom'
      );
      // this.isEffectivityGroupValid = false;
      return;
    }
    console.log(this.getYears().length > 5);

    // if (!startYear || !endYear) {
    //   this.authService.openSnackBar(
    //     'Please select both a start year and an end year.',
    //     'close',
    //     'bottom'
    //   );
    //   // this.isEffectivityGroupValid = false;
    //   return;
    // } else if (this.getYears().length < 0 || this.getYears().length > 5) {
    //   this.authService.openSnackBar(
    //     'The selected date range must be exactly 5 years.',
    //     'close',
    //     'bottom'
    //   );
    //   // this.isEffectivityGroupValid = false;
    //   return;
    // }

    // this.isEffectivityGroupValid = true;
    // Get the form array of action plans inside the specified KPI group
    const actionPlanArray = this.getActionPlanFormArray(groupName);

    // Add new action plans based on the updated start and end dates
    actionPlanArray.push(this.addPlanGroup(startYear, endYear));
  }

  addPlanGroup(startYear: number, endYear: number): FormGroup {
    // Calculate the number of target FormControl elements based on the difference between start and end dates
    const numberOfTargets = Math.abs(endYear - startYear) + 1;

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
      plan: [
        '',
        [
          Validators.required,
          actionPlanExistenceValidator(this.backendService),
        ],
      ],
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
    const startYear =
      this.getEffectivityControl('start').value._d.getFullYear();
    const endYear = this.getEffectivityControl('end').value._d.getFullYear();

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

  // getActionPlanControl(groupName: string, actionPlanIndex: number) {
  //   const actionPlanArray = this.getActionPlanFormArray(groupName);
  //   return actionPlanArray.at(actionPlanIndex).get('plan');
  // }

  getResponsiblesControl(groupName: string, actionPlanIndex: number) {
    const actionPlanArray = this.getActionPlanFormArray(groupName).at(
      actionPlanIndex
    ) as FormGroup;
    const responsiblesCtrl = actionPlanArray.get('responsible');
    return responsiblesCtrl;
  }

  submit() {
    this.isLoading = true;
    const kpiValues: any[] = [];
    let groupNames = this.getFormGroupNames();
    // Remove 'effectivity' from the groupNames array
    groupNames = groupNames.filter((name) => name !== 'effectivity');

    groupNames.forEach((groupName) => {
      const groupValue = this.formGroup.get(groupName)?.value;
      if (groupValue) {
        const kpiTitle = groupValue.kpi_title.toUpperCase();
        const actionPlans = groupValue.actionPlan;

        Object.entries(actionPlans).forEach(([key, value]: [string, any]) => {
          const { plan, responsible, start_date, due_date, target } = value;

          const startDateFormatted = this.datePipe.transform(
            start_date,
            'MMMM d'
          );
          const dueDateFormatted = this.datePipe.transform(due_date, 'MMMM d');
          const targetObj: any = {};

          this.getYears().forEach((value, i) => {
            targetObj[value] = target[i];
          });
          kpiValues.push({
            kpi_title: kpiTitle.toUpperCase(),
            plan,
            responsible,
            startDateFormatted,
            dueDateFormatted,
            targets: targetObj,
            dept: this.currentUserDept,
          });
        });
      }
    });

    const dialogRef = this.dialog.open(ReviewKpisComponent, {
      width: '1000px',
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '400ms',
      data: kpiValues,
    });
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        let msg: any = { title: '', content: '' };
        if (result) {
          this.backendService
            .addKpiAndActionPlansFirebase(kpiValues)
            .subscribe({
              next: () => {
                msg.title = 'Success!';
                msg.content =
                  'KPIs and Action Plans have been added successfully.';
              },
              error: (error) => {
                msg.title = 'Error!';
                msg.content =
                  'An error occurred while adding KPIs and Action Plans. Please try again later.';
              },
              complete: () => {
                const dialogBoxData: IDialogBox = {
                  title: msg.title,
                  content: msg.content,
                  buttons: [
                    {
                      isVisible: true,
                      matDialogCloseValue: false,
                      content: 'Close',
                    },
                  ],
                };

                this.dialog.open(DialogBoxComponent, {
                  ...dialogBoxConfig,
                  data: dialogBoxData,
                });
                const { firstname, lastname, department } =
                  this.authService.getUserInformationFirebase();
                const fullname = `${firstname} ${lastname}`.toUpperCase();
                const message = `${fullname} has created new Objectives`;
                this.backendService.addLog({
                  message,
                  timestamp: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
                  department: department,
                  type: 'create-objectives'
                });
                const { role } = this.authService.getUserInformationFirebase();
                if (role === 'Admin') {
                  this.backendService
                    .fetchAllObjectivesAndActionPlansByDept(department)
                    .subscribe({
                      next: (data: any[]) => {
                        this.backendService.setAllObjectiveAndActionPlansByDept(
                          data
                        );
                      },
                      error: (error) => {
                        this.backendService.setAllObjectiveAndActionPlansByDept(
                          []
                        );
                      },
                      complete: () => {
                        this.isLoading = false;
                        this.routerService.routeTo('dashboard');
                      },
                    });
                }
              },
            });
        }
      },
    });
  }
}
