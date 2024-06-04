import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as _moment from 'moment';
import { AuthService } from 'src/app/core/services/auth.service';
const moment = _moment;
@Component({
  selector: 'app-update-obj-and-plans',
  templateUrl: './update-obj-and-plans.component.html',
  styleUrls: ['./update-obj-and-plans.component.css'],
})
export class UpdateObjAndPlansComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef, // Inject ChangeDetectorRef,
    private datePipe: DatePipe,
    private authService: AuthService
  ) {}
  effectivity!: FormGroup;
  formGroup!: FormGroup;
  targetYears!: string[];
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
  isYearValids: boolean = false;
  ngOnInit() {
    this.targetYears = Object.keys(this.data.targets);
    this.effectivity = this.fb.group({
      start: [moment()],
      end: [moment()],
    });

    const {
      dept,
      startDateFormatted,
      dueDateFormatted,
      kpi_title,
      plan,
      responsible,
      targets,
    } = this.data;
    this.formGroup = this.fb.group({
      kpi_title: [kpi_title, [Validators.required]],
      plan: [plan, [Validators.required]],
      start_date: [startDateFormatted, [Validators.required]],
      due_date: [dueDateFormatted, [Validators.required]],
      responsible: [responsible, [Validators.required]],
      targets: this.fb.array(Object.values(targets)),
      dept: [dept, [Validators.required]],
    });
    this.effectivity.valueChanges.subscribe({
      next: () => {
        const startYear = this.getEffectivityControls('start');
        const endYear = this.getEffectivityControls('end');

        if (startYear.value.isValid && endYear.value.isValid) {
          const startYearValue = parseInt(startYear.value.format('YYYY'), 10);
          const endYearValue = parseInt(endYear.value.format('YYYY'), 10);

          const differenceInYears = endYearValue - startYearValue;

          if (differenceInYears !== 4) {
            this.isYearValids = false;
          } else {
            const newYears = [];
            for (let i = startYearValue; i <= endYearValue; i++) {
              newYears.push(`${i}`);
            }
            this.targetYears = newYears;
            this.isYearValids = true;
          }
        }
      },
    });

    // Manually trigger change detection
    this.cdr.detectChanges();
  }

  getEffectivityControls(controlName: string): any {
    return this.effectivity.get(controlName);
  }
  getDate(date: string) {
    return new Date(date);
  }

  getControl(controlName: string): any {
    return this.formGroup.get(controlName) as FormControl;
  }
  getFormArray(arrayName: string) {
    return this.formGroup.get(arrayName) as FormArray;
  }

  getData() {
    const { start_date, due_date } = this.formGroup.value;
    const targetsFormArray = this.getFormArray('targets');
    const targets: any = {};
    this.targetYears.forEach((year: string, i) => {
      targets[year] = targetsFormArray.at(i).value;
    });
    const modifiedData = {
      ...this.formGroup.value,
      start_date: this.datePipe.transform(start_date, 'MMMM d'),
      due_date: this.datePipe.transform(due_date, 'MMMM d'),
      targets
    };
    return modifiedData;
  }

  //   dept
  // :
  // "SCHOOL OF COMPUTING"
  // dueDateFormatted
  // :
  // "May 1"
  // kpi_title
  // :
  // "IMPROVE CUSTOMER & STAKEHOLDER SATISFACTION"
  // plan
  // :
  // "Provision meaningful and relevant learning experience (research, service learning, collaborative sponsored by student orgs\n(webinar/seminars, reseach colloquium enrichment activities)"
  // responsible
  // :
  // (3) ['Dean', 'Chair', 'Faculty']
  // startDateFormatted
  // :
  // "July 1"
  // target
  // :
  // "≥ 85%"
  // targets
  // :
  // {2024: '≥ 85%', 2025: '≥ 85%', 2026: '≥ 85%', 2027: '≥ 85%', 2028: '≥ 85%'}
}
